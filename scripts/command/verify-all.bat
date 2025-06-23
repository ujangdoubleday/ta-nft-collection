@echo off
echo NFT Contracts Verifier (All-in-One)
echo.

if "%~1"=="" (
  echo Usage: verify-all.bat ^<factory-address^> ^<collection-address^>
  echo Example: verify-all.bat 0x38BB9170AdE58DE906527ee4521FC8605a3DF76D 0xC8EAD2de9769df4bdeAbA3cE51eB895a4D66F26a
  exit /b 1
)

if "%~2"=="" (
  echo Usage: verify-all.bat ^<factory-address^> ^<collection-address^>
  echo Example: verify-all.bat 0x38BB9170AdE58DE906527ee4521FC8605a3DF76D 0xC8EAD2de9769df4bdeAbA3cE51eB895a4D66F26a
  exit /b 1
)

set FACTORY_ADDRESS=%~1
set COLLECTION_ADDRESS=%~2

echo ==================================
echo Step 1: Verifying NFT Factory
echo ==================================
set CONTRACT_ADDRESS=%FACTORY_ADDRESS%
echo Setting CONTRACT_ADDRESS to %CONTRACT_ADDRESS%
echo.

call bun run verify:factory

echo.
echo ==================================
echo Step 2: Verifying NFT Collection
echo ==================================
set CONTRACT_ADDRESS=%COLLECTION_ADDRESS%
echo Setting CONTRACT_ADDRESS to %CONTRACT_ADDRESS%
echo.

call bun run verify:collection

echo.
echo ==================================
echo All verification processes completed.
echo ================================== 