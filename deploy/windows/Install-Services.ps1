[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$NginxExe,
    [Parameter(Mandatory)][string]$NssmExe
)
$ErrorActionPreference = 'Stop'
$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
if (-not (New-Object Security.Principal.WindowsPrincipal($identity)).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Run PowerShell as Administrator.'
}
$NginxExe = (Resolve-Path -LiteralPath $NginxExe).Path
$NssmExe = (Resolve-Path -LiteralPath $NssmExe).Path
$node = (Get-Command node.exe -ErrorAction Stop).Source
$repo = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$runtime = Join-Path $PSScriptRoot 'runtime'
$settings = Get-Content (Join-Path $runtime 'settings.json') -Raw | ConvertFrom-Json
foreach ($required in @('BGG_BE/.env', 'BGG_BE/dist/main.js', 'BGG_FE/dist/index.html')) {
    if (-not (Test-Path (Join-Path $repo $required))) { throw "Missing $required. Configure .env and run Prepare.ps1 first." }
}
foreach ($name in @('BGG-Backend', 'BGG-Web')) {
    if (Get-Service -Name $name -ErrorAction SilentlyContinue) { throw "Service $name already exists. See README for updates." }
}
foreach ($port in @($settings.WebPort, $settings.BackendPort)) {
    if (Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue) { throw "Port $port is in use." }
}
$prefix = $runtime.Replace('\','/') + '/'
New-Item -ItemType Directory -Force -Path (Join-Path $runtime 'logs'), (Join-Path $runtime 'temp') | Out-Null
& $NginxExe -t -p $prefix -c nginx.conf
if ($LASTEXITCODE -ne 0) { throw 'Nginx config check failed.' }
function Invoke-Nssm {
    param([string[]]$Arguments)
    & $NssmExe @Arguments
    if ($LASTEXITCODE -ne 0) { throw "NSSM failed: $($Arguments[0]) $($Arguments[1])" }
}
Invoke-Nssm -Arguments @('install', 'BGG-Backend', $node, 'dist/main.js')
Invoke-Nssm -Arguments @('set', 'BGG-Backend', 'AppDirectory', (Join-Path $repo 'BGG_BE'))
Invoke-Nssm -Arguments @('set', 'BGG-Backend', 'AppEnvironmentExtra', 'NODE_ENV=production', 'HOST=127.0.0.1', "PORT=$($settings.BackendPort)")
Invoke-Nssm -Arguments @('install', 'BGG-Web', $NginxExe, '-p ./ -c nginx.conf')
Invoke-Nssm -Arguments @('set', 'BGG-Web', 'AppDirectory', $runtime)
Invoke-Nssm -Arguments @('set', 'BGG-Web', 'DependOnService', 'BGG-Backend')
foreach ($name in @('BGG-Backend', 'BGG-Web')) {
    Invoke-Nssm -Arguments @('set', $name, 'Start', 'SERVICE_AUTO_START')
    Invoke-Nssm -Arguments @('set', $name, 'AppExit', 'Default', 'Restart')
    Invoke-Nssm -Arguments @('set', $name, 'AppRestartDelay', '5000')
    Invoke-Nssm -Arguments @('set', $name, 'AppStdout', (Join-Path $runtime "logs/$name.out.log"))
    Invoke-Nssm -Arguments @('set', $name, 'AppStderr', (Join-Path $runtime "logs/$name.err.log"))
    Invoke-Nssm -Arguments @('set', $name, 'AppRotateFiles', '1')
    Invoke-Nssm -Arguments @('set', $name, 'AppRotateOnline', '1')
    Invoke-Nssm -Arguments @('set', $name, 'AppRotateBytes', '10485760')
}
Start-Service BGG-Backend
Start-Service BGG-Web
Write-Host "Services installed. Test http://localhost:$($settings.WebPort) before opening firewall."
