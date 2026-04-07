import * as PIXI from "pixi.js";

/**
 * Creates a reusable PixiJS Avatar container
 * * @param {string} username - The display name above the avatar
 * @param {number} color - Hex color code (e.g., 0x3b82f6 for blue, 0xef4444 for red)
 * @param {number} startX - Initial X position
 * @param {number} startY - Initial Y position
 * @returns {PIXI.Container} The compiled avatar object
 */
export const createAvatar = (
  username,
  color = 0x3b82f6,
  startX = 0,
  startY = 0,
) => {
  // 1. Create a container to hold both the shape and the text
  const container = new PIXI.Container();

  // 2. Draw the Avatar Body
  const body = new PIXI.Graphics();
  body.circle(0, 0, 20);
  body.fill(color);

  // 3. Create the Name Label
  const label = new PIXI.Text({
    text: username,
    style: {
      fill: "#000000", // Black text
      fontSize: 14,
      fontWeight: "bold",
    },
  });

  // Center the text and position it above the circle
  label.anchor.set(0.5);
  label.y = -35;

  // 4. Assemble the container
  container.addChild(body);
  container.addChild(label);

  // 5. Set initial position
  container.x = startX;
  container.y = startY;

  return container;
};
