@echo off
echo NFT Collection Verifier

if "%~1"=="" (
  echo Usage: verify-contracts.bat ^<contract-address^>
  echo Example: verify-contracts.bat 0xC8EAD2de9769df4bdeAbA3cE51eB895a4D66F26a
  exit /b 1
)

set CONTRACT_ADDRESS=%~1
echo Setting CONTRACT_ADDRESS to %CONTRACT_ADDRESS%

echo.
echo Verifying NFT Collection contract at %CONTRACT_ADDRESS%...
echo.

call bun run verify:collection

echo.
echo Verification process completed.
echo. 