@echo off
echo Setting up GitHub Pages...
git checkout -b gh-pages
git push origin gh-pages
echo.
echo GitHub Pages branch created and pushed!
echo.
echo Visit the repository settings to enable GitHub Pages:
echo https://github.com/krtkzero/gamesnack/settings/pages
echo.
echo Set the source to "gh-pages" branch and save.
echo.
echo After enabling, your site will be available at:
echo https://krtkzero.github.io/gamesnack/
echo.
pause 