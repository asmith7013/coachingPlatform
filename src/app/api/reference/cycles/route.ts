import { CycleModel } from "@/models/core/cycle.model";
import { connectToDB } from "@/lib/db";

export async function GET() {
  try {
    await connectToDB();
    
    const cycles = await CycleModel.find({})
      .sort({ cycleNum: 1 })
      .select("_id cycleNum supportCycle implementationIndicator")
      .limit(100)
      .lean();
    
    const options = cycles.map(cycle => {
      // Safely access properties and ensure they exist
      const id = cycle._id ? cycle._id.toString() : '';
      const cycleNum = typeof cycle.cycleNum === 'number' ? cycle.cycleNum : 0;
      const supportCycle = typeof cycle.supportCycle === 'string' ? cycle.supportCycle : '';
      const indicator = typeof cycle.implementationIndicator === 'string' ? cycle.implementationIndicator : '';
      
      return {
        value: id,
        label: `Cycle ${cycleNum}: ${supportCycle || indicator}`
      };
    });
    
    return Response.json(options);
  } catch (error) {
    console.error("Error fetching cycles:", error);
    return Response.json({ error: "Failed to fetch cycles" }, { status: 500 });
  }
} 