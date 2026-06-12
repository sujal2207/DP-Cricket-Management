import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Cricketer from "@/models/Cricketer";

export async function GET() {
  try {
    await connectDB();

    const [
      totalPlayers,
      totalBatters,
      totalBowlers,
      totalAllRounders,
      totalWicketKeepers,
      categoryDistribution,
    ] = await Promise.all([
      Cricketer.countDocuments(),
      Cricketer.countDocuments({ cricket_categories: "Batting" }),
      Cricketer.countDocuments({ cricket_categories: "Bowling" }),
      Cricketer.countDocuments({ cricket_categories: "All Rounder" }),
      Cricketer.countDocuments({ cricket_categories: "Wicket Keeper" }),
      Cricketer.aggregate([
        { $unwind: "$cricket_categories" },
        { $group: { _id: "$cricket_categories", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return NextResponse.json({
      totalPlayers,
      totalBatters,
      totalBowlers,
      totalAllRounders,
      totalWicketKeepers,
      categoryDistribution: categoryDistribution.map(
        (item: { _id: string; count: number }) => ({
          category: item._id,
          count: item.count,
        })
      ),
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
