[CmdletBinding()]
param(
    [ValidateRange(1,65535)][int]$WebPort = 8088,
    [ValidateRange(1,65535)][int]$BackendPort = 3008
)
$ErrorActionPreference = 'Stop'
if ($WebPort -eq $BackendPort) { throw 'WebPort and BackendPort must differ.' }
$repo = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$runtime = Join-Path $PSScriptRoot 'runtime'
$npm = (Get-Command npm.cmd -ErrorAction Stop).Source
foreach ($folder in @('BGG_BE', 'BGG_FE')) {
    Push-Location (Join-Path $repo $folder)
    try {
        & $npm ci
        if ($LASTEXITCODE -ne 0) { throw "npm ci failed: $folder" }
        & $npm run build
        if ($LASTEXITCODE -ne 0) { throw "Build failed: $folder" }
    } finally { Pop-Location }
}
New-Item -ItemType Directory -Force -Path $runtime, (Join-Path $runtime 'logs') | Out-Null
$webRoot = (Join-Path $repo 'BGG_FE/dist').Replace('\','/')
$config = @'
worker_processes 1;
error_log logs/error.log;
pid logs/nginx.pid;
events { worker_connections 1024; }
http {
    types {
        text/html html;
        text/css css;
        application/javascript js mjs;
        application/json json webmanifest;
        image/png png;
        image/jpeg jpg jpeg;
        image/svg+xml svg;
        image/x-icon ico;
        font/woff2 woff2;
    }
    default_type application/octet-stream;
    access_log logs/access.log;
    server {
        listen __WEB_PORT__;
        server_name _;
        root "__WEB_ROOT__";
        index index.html;
        location /api/ {
            proxy_pass http://127.0.0.1:__BACKEND_PORT__;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 120s;
        }
        location / {
            try_files $uri $uri/ /index.html;
            add_header Cache-Control "no-cache";
        }
    }
}
'@
$config = $config.Replace('__WEB_PORT__', "$WebPort").Replace('__BACKEND_PORT__', "$BackendPort").Replace('__WEB_ROOT__', $webRoot)
[IO.File]::WriteAllText((Join-Path $runtime 'nginx.conf'), $config, (New-Object Text.UTF8Encoding($false)))
@{ WebPort = $WebPort; BackendPort = $BackendPort } | ConvertTo-Json | Set-Content (Join-Path $runtime 'settings.json') -Encoding UTF8
Write-Host "Prepared HTTP port $WebPort -> backend 127.0.0.1:$BackendPort"
