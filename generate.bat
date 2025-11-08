@echo off

:: Change directory to the location of the .bat file
cd /d %~dp0

echo ========================================
echo    Generating Swagger Models and Controllers
echo ========================================

echo.
echo Generating all services from Swagger files...
echo - Attempt Service
echo - Choice Service
echo - Course Service
echo - Exam Service
echo - Question Service
echo.

CALL mvn generate-sources

echo.
echo ========================================
echo    Generation Completed Successfully!
echo ========================================

echo.
echo Generated files location:
echo target/generated-sources/openapi/com/iti/training/exam/
echo.
echo - Models: model/generated/
echo - Controllers: core/controller/
echo.

pause