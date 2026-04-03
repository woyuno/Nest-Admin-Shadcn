$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

function Invoke-Step {
  param(
    [string]$Name,
    [scriptblock]$Action
  )

  Write-Host ""
  Write-Host "==> $Name" -ForegroundColor Cyan
  & $Action
}

$root = Split-Path -Parent $PSScriptRoot

Push-Location $root
try {
  Invoke-Step "[1/4] Server build" {
    Push-Location (Join-Path $root 'server')
    try {
      yarn build
    }
    finally {
      Pop-Location
    }
  }

  Invoke-Step "[2/4] Server pagination test" {
    Push-Location (Join-Path $root 'server')
    try {
      yarn test src/common/utils/pagination.spec.ts
    }
    finally {
      Pop-Location
    }
  }

  Invoke-Step "[3/4] Admin build" {
    Push-Location (Join-Path $root 'admin-shadcn')
    try {
      pnpm build
    }
    finally {
      Pop-Location
    }
  }

  Invoke-Step "[4/4] Admin template tests" {
    Push-Location (Join-Path $root 'admin-shadcn')
    try {
      pnpm test src/components/layout/admin-page-shell.test.tsx src/views/auth/lib/page-registry.contract.test.ts
    }
    finally {
      Pop-Location
    }
  }

  Write-Host ""
  Write-Host "Template smoke verification completed." -ForegroundColor Green
  Write-Host "Next manual checks: login, sidebar menu, users page, scheduled jobs page, Swagger." -ForegroundColor Yellow
}
finally {
  Pop-Location
}
