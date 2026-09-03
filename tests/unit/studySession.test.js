import { describe, it, expect, beforeEach, vi } from "vitest";
import { EbbinghausManager } from "../../src/utils/ebbinghaus.js";

describe("createStudySession visibility accounting", () => {
  let mgr;

  beforeEach(() => {
    mgr = new EbbinghausManager();
    mgr.progress.dailyStudyMinutes = 0;
    vi.spyOn(mgr, "save").mockImplementation(() => {});
  });

  it("does not inflate short sessions to 1 minute", () => {
    const session = mgr.createStudySession();
    const minutes = session.stop();
    expect(minutes).toBe(0);
    expect(mgr.progress.dailyStudyMinutes).toBe(0);
  });

  it("checkDailyLimit reports reached when current >= limit", () => {
    mgr.progress.settings.dailyTimeLimitMinutes = 40;
    mgr.progress.dailyStudyMinutes = 40;
    const r = mgr.checkDailyLimit();
    expect(r.reached).toBe(true);
    expect(r.minutesLeft).toBe(0);
  });

  it("dailyLimitTriggered resets across calendar days", () => {
    mgr.progress.dailyLimitDate = "1999-01-01";
    mgr.progress.dailyLimitTriggered = true;
    expect(mgr.isDailyLimitTriggered()).toBe(false);
    mgr.markDailyLimitTriggered(true);
    expect(mgr.isDailyLimitTriggered()).toBe(true);
    mgr.markDailyLimitTriggered(false);
    expect(mgr.isDailyLimitTriggered()).toBe(false);
  });
});
