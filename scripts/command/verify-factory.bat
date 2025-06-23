@echo off
echo NFT Factory Verifier

if "%~1"=="" (
  echo Usage: verify-factory.bat ^<factory-contract-address^>
  echo Example: verify-factory.bat 0x38BB9170AdE58DE906527ee4521FC8605a3DF76D
  exit /b 1
)

set CONTRACT_ADDRESS=%~1
echo Setting CONTRACT_ADDRESS to %CONTRACT_ADDRESS%

echo.
echo Verifying NFT Factory contract at %CONTRACT_ADDRESS%...
echo.

call bun run verify:factory

echo.
echo Verification process completed.
echo. 