import { describe, it, expect } from "vitest";
import { buildDailyQuestTasks } from "../../src/utils/mapHub/dailyQuestModal.js";

describe("DailyQuestModal Task Builder", () => {
  it("converts a planned session into structured UI tasks with sequence and badges", () => {
    const mockSession = {
      blockOrder: ["new", "review", "new", "review"],
      newChars: [
        { id: "char_001", char: "日", charData: { id: "char_001" } },
        { id: "char_002", char: "月", charData: { id: "char_002" } },
      ],
      reviews: [
        { id: "char_003", char: "水", charData: { id: "char_003" } },
        { id: "char_004", char: "火", charData: { id: "char_004" } },
      ],
    };

    const tasks = buildDailyQuestTasks(mockSession);
    // 4 learn/review + 1 book trailer
    expect(tasks.length).toBe(5);

    expect(tasks[0].type).toBe("new");
    expect(tasks[0].char).toBe("日");
    expect(tasks[0].stepNum).toBe(1);
    expect(tasks[0].badge).toBe("新字宝宝");

    expect(tasks[1].type).toBe("review");
    expect(tasks[1].char).toBe("水");
    expect(tasks[1].stepNum).toBe(2);
    expect(tasks[1].badge).toBe("老朋友");

    expect(tasks[2].type).toBe("new");
    expect(tasks[2].char).toBe("月");

    expect(tasks[3].type).toBe("review");
    expect(tasks[3].char).toBe("火");

    expect(tasks[4].type).toBe("book");
    expect(tasks[4].questId).toBe("book:daily");
  });

  it("handles empty or partial sessions gracefully", () => {
    const emptyTasks = buildDailyQuestTasks({ blockOrder: [], newChars: [], reviews: [] });
    expect(emptyTasks).toEqual([]);

    const nullTasks = buildDailyQuestTasks({});
    expect(nullTasks).toEqual([]);
  });
});
