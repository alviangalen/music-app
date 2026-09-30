import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { HealthResponse, ITunesSearchResponse, SearchQuery, Track } from "./types.js";

export const apiRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Healthcheck endpoint for Docker healthcheck and container orchestrators
  fastify.get<{ Reply: HealthResponse }>("/healthz", async (_request, reply) => {
    return reply.status(200).send({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Music search endpoint (BFF querying public iTunes Search API)
  fastify.get<{
    Querystring: SearchQuery;
    Reply: Track[] | { error: string };
  }>("/api/search", async (request, reply) => {
    const rawQuery = request.query.q;
    const query = typeof rawQuery === "string" ? rawQuery.trim() : "";

    if (!query) {
      return reply.status(400).send({
        error: "Query parameter 'q' is required",
      });
    }

    try {
      const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
        query
      )}&media=music&entity=song&limit=25`;

      const response = await fetch(itunesUrl, {
        headers: {
          Accept: "application/json",
          "User-Agent": "MusicApp-BFF/1.0",
        },
      });

      if (!response.ok) {
        fastify.log.error(
          `iTunes API responded with status ${response.status}: ${response.statusText}`
        );
        return reply.status(502).send({
          error: "Failed to fetch data from upstream music provider",
        });
      }

      const data = (await response.json()) as ITunesSearchResponse;

      // Filter playable music tracks and map cleanly to the required schema
      const tracks: Track[] = (data.results || [])
        .filter((item) => Boolean(item.trackId && item.trackName && item.previewUrl))
        .map((item) => ({
          id: item.trackId,
          title: item.trackName,
          artist: item.artistName || "Unknown Artist",
          album: item.collectionName || "Single",
          // Upgrade 100x100 thumbnail to 600x600 for sharp rendering
          artworkUrl: item.artworkUrl100
            ? item.artworkUrl100.replace("100x100bb", "600x600bb")
            : "",
          previewUrl: item.previewUrl as string,
        }))
        .slice(0, 15);

      return reply.status(200).send(tracks);
    } catch (error) {
      fastify.log.error(error, "Unexpected error fetching from iTunes API");
      return reply.status(500).send({
        error: "Internal server error occurred while searching tracks",
      });
    }
  });
};