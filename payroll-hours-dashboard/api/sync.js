export async function onRequestPost() {
  return Response.json(
    {
      ok: false,
      message:
        "This site does not have a Microsoft Graph/OAuth backend configured. Run the sync workflow in Codex, or connect an Outlook API to refresh this endpoint.",
    },
    { status: 202 },
  );
}
