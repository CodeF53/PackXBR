# PackXBR
A utility for automatic application of the XBR scaling algorithm to game textures, specifically designed for Minecraft resource packs.

## Usage
1. Go to [packxbr.f53.dev](https://packxbr.f53.dev/)
2. Choose a .zip file containing .png images you want to scale
3. Select Scale Factor and Auto/Manual
4. (Manual Only), choose options to scale each image.
5. The scaled zip will be saved once all images have been processed.

## Terminology
### Edge Handling
Depending on what what a texture looks like, you will want the edges of it to be handled differently.

Here are a couple of examples covering all the wrap modes, and where they would be used:\
![Example of edge options you may choose for a ladder](https://cdn.discordapp.com/attachments/821452669771972608/977375979297181696/Ladder.png)\
![Example of edge options you may choose for foliage](https://cdn.discordapp.com/attachments/821452669771972608/977375979934728192/Acacia_Sapling.png)\
![Example of edge options you may choose for grass-like blocks](https://cdn.discordapp.com/attachments/821452669771972608/977375980928765973/Warped_Nylium_Side.png)\

### Relayer
Normally, xBRZ rounds off the edges of textures, which can lead to holes in the corners of models!

Relayer is a tool to make this doesn't happen. It basically un-rounds corners by underlaying a Nearest Neighbor upscale of the original texture beneath the result from xBRZ.

!["demo" of relayer](https://cdn.discordapp.com/attachments/1082142594567516160/1115403058512416768/image.png)

## Auto vs Manual
You may be thinking:
> if there is a mode to automatically scale everything, why would I ever use manual?

Because the tool has no idea what each image given to it is, the best it can do for how to handle scaling it is guess based on the directory it's inside of.

Heres the logic Auto mode uses:
1. by default all images have relayer off and use void for all their edges.
2. inside `block/`, all edges are treated with wrap
3. inside `model/` or `entity/`, relayer is used
4. inside `painting/`, all edges are treated with extend
5. inside `font/` or `colormap/`, the image isn't scaled

While this logic leads to a half-decent result, its not perfect. So, if you have the time, I highly recommend using manual.

## Misc
If you have any questions or suggestions, please contact me inside the  [the VanillaXBR discord](https://discord.com/invite/8N4xzej)!
