let mySprite: Sprite = null;
let mySprite2: Sprite = null;
let mySprite3: Sprite = null;
let mySprite4: Sprite = null;
let mySprite5: Sprite = null;
let canAttack = false;
let canSpawn = true;

namespace SpriteKind {
    export const NPC = SpriteKind.create()
}

function initGame() {
    info.setLife(100)

    // Professional and expanded GNU GPL v1.0 Legal Notice
    game.splash(
        "This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 1 of the License, or (at your option) any later version.\n\n" 
    )

    game.splash(
        "Copyright (C) 2026 Trenton Brunston. All Rights Reserved."
    )

    tiles.setCurrentTilemap(tilemap`area 1`);
    mySprite = sprites.create(assets.image`Trenton`, SpriteKind.Player);
    controller.moveSprite(mySprite, 100, 0);
    scene.cameraFollowSprite(mySprite);
    scene.setBackgroundColor(8);
}


initGame();

game.onUpdate(function () {
    mySprite.ay = 300;
});

// Jump logic 
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (mySprite.isHittingTile(CollisionDirection.Bottom)) {
        mySprite.vy = -175;
    }
});

// Travel to area 2 
scene.onOverlapTile(SpriteKind.Player, assets.tile`travel arrow`, function (sprite, location) {
    tiles.setCurrentTilemap(tilemap`area 2`);
    tiles.placeOnRandomTile(sprite, assets.tile`teleporter`);
    scene.setBackgroundColor(8);
});

// Magma death 
scene.onOverlapTile(SpriteKind.Player, assets.tile`magma`, function (sprite, location) {
    game.setGameOverMessage(false, "GAME OVER!")
    info.changeLifeBy(-1)
});

// Travel to area 3 (Spawns Giggity Bird and General Vladimir) 
scene.onOverlapTile(SpriteKind.Player, assets.tile`travel arrow green`, function (sprite, location) {
    tiles.setCurrentTilemap(tilemap`area 3`);
    tiles.placeOnRandomTile(sprite, assets.tile`teleporter`);
    scene.setBackgroundColor(8);
    giggity_birds();
    general_vladimir_npc(); // MOVED: Spawns the NPC safely inside area 3
});

// Shoot projectile 
    controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
        if (canAttack) {
            // 1. Shoot to the right (Original sprite)
            let myDartRight = sprites.createProjectileFromSprite(assets.image`projectile`, mySprite, 200, 0);

            // 2. Shoot to the left (Negative velocity and new image asset)
            let myDartLeft = sprites.createProjectileFromSprite(assets.image`projectile_left`, mySprite, -200, 0);

            // Note: You can remove flipX(true) if your projectile_left image is already facing left!
        }
    });

function right_animation() {
    animation.runImageAnimation(mySprite, assets.animation`right`, 150, true)

}

function left_animation() {
    animation.runImageAnimation(mySprite, assets.animation`left`, 150, true)

}

controller.right.onEvent(ControllerButtonEvent.Pressed, function() {
    left_animation();
})

controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    right_animation();
})


// Spawn Giggity Bird function 
function giggity_birds() {
    if (!mySprite2) {
        mySprite2 = sprites.create(assets.image`Giggitybird`, SpriteKind.Enemy);
    }
}

function spawn() {
    if (!mySprite5) {
        mySprite5 = sprites.create(assets.image`mySprite5`, SpriteKind.Enemy);
    }
}

function giggity_spawner() {
    scene.onOverlapTile(SpriteKind.Player, assets.tile`Giggity_spawner`, function (sprite: Sprite, location: tiles.Location) {
        // Check if the spawner is ready and not on cooldown
        if (canSpawn) {
            // 1. Activate the cooldown immediately
            canSpawn = false

            // 2. Spawn the enemy inside the overlap event
            let mySprite5 = sprites.create(assets.image`mySprite5`, SpriteKind.Enemy)

            // 3. Place the enemy directly on the tile that triggered the spawn
            tiles.placeOnTile(mySprite5, location)

            // 4. Make this specific enemy follow your player
            mySprite5.follow(mySprite, 50) // 50 is the speed

            // 5. Wait 3 seconds (3000ms) before allowing another spawn
            pause(100)
            canSpawn = true
        }
    })
}


// This loop runs every 5000 milliseconds (5 seconds) to create a new spawner tile
game.onUpdateInterval(5000, function () {
    // Choose a random column and row on your map (adjust 10 and 10 to fit your map size) 
    let randomX = randint(0, 10)
    let randomY = randint(0, 10)
    let spawnLocation = tiles.getTileLocation(randomX, randomY)

    // Place the spawner tile at the random location 
    tiles.setTileAt(spawnLocation, assets.tile`Giggity_spawner`)
})


function general_vladimir_npc() {
    if (!mySprite3) {
        mySprite3 = sprites.create(assets.image`General Vladimir`, SpriteKind.NPC)
        mySprite3.ax = 0
        mySprite3.ay = 300
        mySprite3.vy = 0
        mySprite3.follow(mySprite, 45)

        let vstTiles = tiles.getTilesByType(assets.tile`VST`)
        if (vstTiles.length > 0) {
            tiles.placeOnRandomTile(mySprite3, assets.tile`VST`)
        }
    }
}

// --- LEVEL TRANSITIONS & TELEPORTERS ---
function blue_teleporter() {
    scene.onOverlapTile(SpriteKind.Player, assets.tile`blue_teleporter`, function (sprite, location) {
        tiles.setCurrentTilemap(tilemap`area_4`)
        tiles.placeOnRandomTile(sprite, assets.tile`teleporter`)
        scene.setBackgroundColor(6)
        giggity_spawner();
        sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (sprite, otherSprite) {
            sprite.destroy();
            otherSprite.destroy();
        })
    })


}

scene.onOverlapTile(SpriteKind.Player, assets.tile`heal`, function (sprite, location) {
    info.setLife(200)
});

scene.onOverlapTile(SpriteKind.Player, assets.tile`travel_arrow_white`, function (sprite, location) {
    tiles.setCurrentTilemap(tilemap`area5`)
    tiles.placeOnRandomTile(sprite, assets.tile`teleporter`);
    giggity_spawner();
});

// --- OVERLAP EVENTS ---

// 1. Player interacts with General Vladimir
sprites.onOverlap(SpriteKind.Player, SpriteKind.NPC, function (player, npc) {
    npc.follow(player, 60)
    game.splash("General Vladimir: The Giggity Birds have been building nests here.")
    game.splash("General Vladimir: Its not safe to be in here!")
    game.splash("General Vladimir: Take this weapon!")
    game.splash("You unlocked the attack!")

    canAttack = true
    sprites.destroy(mySprite3)
    tiles.setCurrentTilemap(tilemap`area3B`)

    if (mySprite2) {
        mySprite2.follow(mySprite, 50)
    }
    npc.follow(null)
})

sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (sprite, otherSprite) {
    sprite.destroy();
    otherSprite.destroy();

    // Check if the enemy destroyed belongs to the area trigger
    // (You can assign a specific image, kind, or variable to your gatekeeper enemy)
    if (otherSprite == mySprite2) {
        blue_teleporter();
        tiles.setCurrentTilemap(tilemap`area3R`);
    }
})

// 3. Enemy hits Player (Loses life)
sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, otherSprite) {
    game.setGameOverMessage(false, "You have been defeated by a Giggity Bird")
    info.changeLifeBy(-1)
})