# Snake Arcade

A vibrant, retro-styled arcade snake game built with React, Vite, and Tailwind CSS.

## Features

- **Classic Gameplay**: Navigate the snake to eat food and grow longer.
- **Dynamic Speed**: The game gets faster as you score more points.
- **Responsive Design**: Playable on both desktop and mobile devices.
- **High Score Tracking**: Keeps track of your best performance using local storage.
- **Retro Aesthetics**: Bold colors and a clean, arcade-inspired interface.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)

## Deployment

This project is configured to automatically deploy to **GitHub Pages** using **GitHub Actions**.

Whenever you push changes to the `main` branch, the `.github/workflows/deploy.yml` workflow will:
1. Install dependencies.
2. Build the project.
3. Deploy the `dist` folder to your GitHub Pages site.

### Set up on GitHub

To enable deployment:
1. Go to your repository settings on GitHub.
2. Navigate to **Pages** (under Code and automation).
3. Under **Build and deployment** > **Source**, ensure it is set to **GitHub Actions**.


## Controls

- **Desktop**: 
  - Use `W`, `A`, `S`, `D` or **Arrow Keys** to move.
  - Press `SPACE` to pause or resume.
- **Mobile**:
  - Use the on-screen directional buttons.
  - Use the pause button to toggle the game state.

## License

This project is licensed under the Apache-2.0 License.
