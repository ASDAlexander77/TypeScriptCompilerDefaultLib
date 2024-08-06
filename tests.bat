if "%1" == "" (
	set BUILD=release
) else (
	set BUILD=debug
)

for /f %%f in ('dir /b .\tests\*.ts') do call scripts\test.bat %%~nf %BUILD%