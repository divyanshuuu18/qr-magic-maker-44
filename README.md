# Quick Code Creator

Build a QR code generator web app with the following features:

Core functionality

Text input field where users can type/paste any content (URL, plain text, email, phone number, WiFi credentials)

Real-time QR code generation as the user types (debounced)

Download button to save the QR code as PNG and SVG

Customization options

Adjustable QR code size (small/medium/large or pixel slider)

Foreground and background color pickers

Error correction level selector (L, M, Q, H)

Optional logo/image upload to embed in the center of the QR code

UX details

Clean, minimal single-page layout

Live preview panel showing the QR code update instantly

Copy-to-clipboard button for the generated image

Mobile-responsive design

Input validation (warn if text is too long for reliable scanning)

Tech preferences

[Specify: React / plain HTML-CSS-JS / etc.]

Use a well-tested QR generation library (e.g., qrcode npm package or qrcode.js)

No backend required — everything should run client-side

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://qr-magic-maker-44.vercel.app/


## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b0f15c95-cafc-41d7-8c36-1173e45c9b64).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
