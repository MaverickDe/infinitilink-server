$binName = "xavren.exe"
$installDir = "C:\Program Files\xavren"
$domain = "http://172.20.10.3:5002"
$url = "$domain/api/releases/windows"

# Ensure the install directory exists
if (-not (Test-Path $installDir)) {
    Write-Host "Creating install directory..."
    New-Item -ItemType Directory -Path $installDir | Out-Null
}

Write-Host "Downloading $binName from $url ..."
Invoke-WebRequest -Uri $url -OutFile "$installDir\$binName"

# Optionally add to PATH (for global command access)
$envPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
if ($envPath -notlike "*$installDir*") {
    Write-Host "Adding $installDir to PATH..."
    setx /M PATH "$envPath;$installDir"
}

Write-Host "✅ Installed successfully!"
Write-Host "Run '$binName --help' or restart your terminal to use it globally."

