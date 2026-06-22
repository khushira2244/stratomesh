// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// type RouteContext = {
//   params: Promise<{
//     caseId: string;
//   }>;
// };

// type ReorderItem = {
//   blockId: string;
//   order: number;
// };

// export async function PATCH(request: Request, context: RouteContext) {
//   try {
//     const { caseId } = await context.params;
//     const body = await request.json();

//     const teamKey = body.teamKey;
//     const blocks: ReorderItem[] = body.blocks;

//     if (!teamKey || !Array.isArray(blocks)) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "teamKey and blocks array are required",
//         },
//         { status: 400 }
//       );
//     }

//     const existingBlocks = await prisma.caseBlock.findMany({
//       where: {
//         caseId,
//         teamKey,
//       },
//       select: {
//         id: true,
//       },
//     });

//     const validBlockIds = new Set(existingBlocks.map((block) => block.id));

//     const invalidBlock = blocks.find((block) => !validBlockIds.has(block.blockId));

//     if (invalidBlock) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "One or more blocks do not belong to this case/team",
//           invalidBlockId: invalidBlock.blockId,
//         },
//         { status: 400 }
//       );
//     }

//     await prisma.$transaction(
//       blocks.map((block) =>
//         prisma.caseBlock.update({
//           where: {
//             id: block.blockId,
//           },
//           data: {
//             order: block.order,
//           },
//         })
//       )
//     );

//     const updatedBlocks = await prisma.caseBlock.findMany({
//       where: {
//         caseId,
//         teamKey,
//       },
//       orderBy: {
//         order: "asc",
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Case blocks reordered",
//       data: updatedBlocks,
//     });
//   } catch (error) {
//     console.error("Reorder case blocks error:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to reorder case blocks",
//         error: error instanceof Error ? error.message : "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    caseId: string;
  }>;
};

type ReorderItem = {
  blockId: string;
  order: number;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { caseId } = await context.params;
    const body = await request.json();

    const teamKey = body.teamKey;
    const blocks: ReorderItem[] = body.blocks;

    if (!teamKey || !Array.isArray(blocks) || blocks.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "teamKey and non-empty blocks array are required",
        },
        { status: 400 }
      );
    }

    const existingBlocks = await prisma.caseBlock.findMany({
      where: {
        caseId,
        teamKey,
      },
      select: {
        id: true,
      },
    });

    const validBlockIds = new Set(existingBlocks.map((block) => block.id));

    const invalidBlock = blocks.find(
      (block) => !validBlockIds.has(block.blockId)
    );

    if (invalidBlock) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more blocks do not belong to this case/team",
          invalidBlockId: invalidBlock.blockId,
        },
        { status: 400 }
      );
    }

    const finalOrders = blocks.map((block) => block.order);
    const uniqueOrders = new Set(finalOrders);

    if (uniqueOrders.size !== finalOrders.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Duplicate order values are not allowed",
        },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Phase 1: move blocks to temporary negative orders
      for (let index = 0; index < blocks.length; index++) {
        await tx.caseBlock.update({
          where: {
            id: blocks[index].blockId,
          },
          data: {
            order: -(index + 1),
          },
        });
      }

      // Phase 2: apply final requested orders
      for (const block of blocks) {
        await tx.caseBlock.update({
          where: {
            id: block.blockId,
          },
          data: {
            order: block.order,
          },
        });
      }
    });

    const updatedBlocks = await prisma.caseBlock.findMany({
      where: {
        caseId,
        teamKey,
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Case blocks reordered",
      data: updatedBlocks,
    });
  } catch (error) {
    console.error("Reorder case blocks error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to reorder case blocks",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}