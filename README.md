# Entropy_Sweeper

A Minesweeper game with entropy and probability analysis, built with JavaScript
and Webpack.

## Features

- Classic Minesweeper gameplay
- Entropy and probability calculation for advanced play
- Self-play (AI) move suggestion (WIP)
- Modern UI with customizable board size and mine count

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

1. Clone this repository:

    ```sh
    git clone <your-repo-url>
    cd Entropy_Sweeper
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

### Build

To build the project for development (with watch mode):

```sh
npm run build
```

This will generate a `dist/bundle.js` file.

### Run (Development Server)

To start a local development server with live reload:

```sh
npm start
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

Alternatively, you can use the
[Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
extension in VS Code and open `index.html` after running `npm run build`.

#### Custom Port

To run the dev server on a custom port (e.g., 1234):

```sh
PORT=1234 npm start
```

## Usage

- Use the sidebar to set the number of rows, columns, and mines, then click
  **Start Game**.
- Click cells to reveal them, right-click to flag.
- The "boh" button is for self-play/AI move suggestion (WIP).
- Entropy and chain information is logged to the browser console after each
  move.

## Project Structure

- `src/` - Main source code
    - `minesweeper.js` - Game logic
    - `entropy/` - Entropy and probability calculation
    - `chains/` - Chain detection logic
    - `sat/` - SAT solver integration
    - `selfPlay.js` - Self-play/AI logic
    - `script.js` - Main entry point
- `styles.css` - UI styles
- `index.html` - Main HTML file

## Development

- Lint code: `npm run lint`
- Format code: `npm run format`
- Run tests: `npm test` (add your tests in a `__tests__` folder)

## License

MIT

---

**Note:** For best results, use the latest version of Chrome or Firefox.
