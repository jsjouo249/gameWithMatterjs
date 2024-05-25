import {Bodies, Body, Engine, Events, Render, Runner, World} from 'matter-js';
import { FRUITS } from './fruits';

let currentBody = null;
let currentFruit = null;
let disableAction = false;
let interval = null;
let watermelonNumber = 0;

const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: '#F7F4C8',
    width: 620,
    height: 850
  }
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: '#E6B143' }
});
const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: '#E6B143' }
});
const bottomWall = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true,
  render: { fillStyle: '#E6B143' }
});
const deadLine = Bodies.rectangle(310, 150, 620, 2, {
  name: 'deadLine',
  isStatic: true,
  isSensor: true,
  render: { fillStyle: '#E6B143' }
});

World.add(world, [leftWall, rightWall, bottomWall, deadLine]);

Render.run(render);
Runner.run(engine);

function addFruit() {
  const index = Math.floor(Math.random() * 8);
  const fruit = FRUITS[index];

  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index,
    isSleeping: true,
    render: {
      sprite: {
        texture: `${fruit.name}.png`
      }
    },
    restitution: 0.3,
  });

  currentBody = body;
  currentFruit = fruit;

  World.add(world, body);
}

window.onkeydown = (event) => {
  if (disableAction) {
    return;
  }

  switch(event.code) {
    case 'KeyA':
      if (interval) return;

      interval = setInterval(() => {
        if (currentBody.position.x - currentFruit.radius > 30) {
          Body.setPosition(currentBody, { x: currentBody.position.x - 1, y: currentBody.position.y });
        }
      }, 5);
      break;
    case 'KeyD':
      if (interval) return;

      interval = setInterval(() => {
        if (currentBody.position.x + currentFruit.radius < 590) {
          Body.setPosition(currentBody, { x: currentBody.position.x + 1, y: currentBody.position.y })
        }
      }, 5);
      break;
    case 'KeyS':
      currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 1000);
      break;
  }
}

window.onkeyup = (event) => {
  switch (event.code) {
    case 'KeyA':
    case 'KeyD':
      clearInterval(interval);
      interval = null;
      break;
  }
}

Events.on(engine, 'collisionStart', (event) => {
  event.pairs.forEach((collisionFruits) => {
    const { bodyA, bodyB } = collisionFruits;

    if (bodyA.index === bodyB.index) {
      if (bodyA.index === FRUITS.length - 1) {
        return;
      }
      const newFruis = FRUITS[bodyA.index + 1];

      World.remove(world, [bodyA, bodyB]);
      const newBody = Bodies.circle(
        collisionFruits.collision.supports[0].x,
        collisionFruits.collision.supports[0].y,
        newFruis.radius,
        {
          render: { sprite: { texture: `${newFruis.name}.png` } },
          index: bodyA.index + 1,
        }
      );

      World.add(world, newBody);

      if (newBody.index === FRUITS.length - 1) {
        watermelonNumber++;
        if (watermelonNumber === 2) {
          alert('You Win!');
        }
      }
    }

    if (!disableAction && (collisionFruits.bodyA.name === 'deadLine' || collisionFruits.bodyB.name === 'deadLine')) {
      alert('Game Over');
    }
  });
});

addFruit();
