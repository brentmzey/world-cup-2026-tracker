import { expect, test, describe } from "bun:test";
import PocketBase from "pocketbase";
import configJson from "../../config.json";

describe("Live Database Integration Tests", () => {
  const pbUrl = configJson.pocketbaseUrl;

  test("Should verify PocketBase URL is configured in config.json", () => {
    expect(pbUrl).toBeDefined();
    expect(pbUrl).toContain("http");
    console.log(`Testing live database integration at: ${pbUrl}`);
  });

  if (pbUrl) {
    const pb = new PocketBase(pbUrl);

    test("Should fetch active tenant configuration profile", async () => {
      const tenantId = configJson.tenantId || "world-cup-classic";
      const record = await pb.collection("tenants").getFirstListItem(`tenantId = "${tenantId}"`);
      
      expect(record).toBeDefined();
      expect(record.tenantId).toBe(tenantId);
      expect(record.appName).toBeDefined();
      expect(record.theme).toBeDefined();
      expect(record.features).toBeDefined();
      expect(record.eventInfo).toBeDefined();
    });

    test("Should fetch host stadiums and verify geo-coordinates", async () => {
      const stadiums = await pb.collection("stadiums").getFullList();
      
      expect(stadiums.length).toBeGreaterThan(0);
      const firstStadium = stadiums[0];
      expect(firstStadium.stadiumId).toBeDefined();
      expect(firstStadium.name).toBeDefined();
      expect(firstStadium.city).toBeDefined();
      expect(firstStadium.country).toBeDefined();
      expect(firstStadium.capacity).toBeTypeOf("number");
      expect(firstStadium.lat).toBeTypeOf("number");
      expect(firstStadium.lng).toBeTypeOf("number");
    });

    test("Should fetch teams registry and verify flag assets", async () => {
      const teams = await pb.collection("teams").getFullList();
      
      expect(teams.length).toBeGreaterThan(0);
      const firstTeam = teams[0];
      expect(firstTeam.teamId).toBeDefined();
      expect(firstTeam.name).toBeDefined();
      expect(firstTeam.code).toHaveLength(3);
      expect(firstTeam.flag).toBeDefined();
      expect(firstTeam.group).toBeDefined();
    });

    test("Should fetch matches and verify relation expand mapping", async () => {
      const matches = await pb.collection("matches").getFullList({
        expand: "homeTeam,awayTeam"
      });
      
      expect(matches.length).toBeGreaterThan(0);
      const firstMatch = matches[0];
      expect(firstMatch.matchId).toBeDefined();
      expect(firstMatch.date).toBeDefined();
      expect(firstMatch.time).toBeDefined();
      expect(firstMatch.stage).toBeDefined();
      expect(firstMatch.status).toBeDefined();
      
      // Verify relation expansions are mapped correctly
      const homeTeam = firstMatch.expand?.homeTeam;
      const awayTeam = firstMatch.expand?.awayTeam;
      
      expect(homeTeam).toBeDefined();
      expect(homeTeam.name).toBeDefined();
      expect(homeTeam.code).toHaveLength(3);
      expect(homeTeam.flag).toBeDefined();
      
      expect(awayTeam).toBeDefined();
      expect(awayTeam.name).toBeDefined();
      expect(awayTeam.code).toHaveLength(3);
      expect(awayTeam.flag).toBeDefined();
    });

    test("Should fetch calculated group standings", async () => {
      const standings = await pb.collection("group_standings").getFullList();
      
      expect(standings.length).toBeGreaterThan(0);
      const firstGroup = standings[0];
      expect(firstGroup.group).toBeDefined();
      expect(Array.isArray(firstGroup.teams)).toBe(true);
      
      const firstTeamStanding = firstGroup.teams[0];
      expect(firstTeamStanding.teamId).toBeDefined();
      expect(firstTeamStanding.teamName).toBeDefined();
      expect(firstTeamStanding.code).toHaveLength(3);
      expect(firstTeamStanding.played).toBeTypeOf("number");
      expect(firstTeamStanding.won).toBeTypeOf("number");
      expect(firstTeamStanding.drawn).toBeTypeOf("number");
      expect(firstTeamStanding.lost).toBeTypeOf("number");
      expect(firstTeamStanding.goalsFor).toBeTypeOf("number");
      expect(firstTeamStanding.goalsAgainst).toBeTypeOf("number");
      expect(firstTeamStanding.points).toBeTypeOf("number");
    });
  }
});
