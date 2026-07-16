# Client onboarding for the first real account

This is the internal activation flow for the first production client.

## 1. Prepare the bridge

- Set Home Assistant as the primary operational bridge.
- Confirm the Tuya integration is working inside Home Assistant.
- Verify that the needed entities are visible.

## 2. Create the client record

- Add the client name.
- Assign the site.
- Set the scope and internal notes.

## 3. Validate the portal

- Open the client portal.
- Confirm cameras, spaces and alerts render correctly.
- Check the status labels and the most recent activity.

## 4. Handle exceptions

- If a device or function does not appear in Home Assistant, mark it as an exception.
- Only then consider a direct fallback path.
- Keep the fallback out of the default narrative.

## Outcome

- One clear operational bridge.
- One portal view for the client.
- One repeatable activation checklist for new accounts.
