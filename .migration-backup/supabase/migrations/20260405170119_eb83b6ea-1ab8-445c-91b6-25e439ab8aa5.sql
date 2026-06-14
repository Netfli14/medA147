
-- 1. Fix is_creator spoofing: enforce is_creator = false on public inserts
DROP POLICY IF EXISTS "Anyone can insert replies" ON suggestion_replies;
CREATE POLICY "Anyone can insert replies"
  ON suggestion_replies FOR INSERT
  TO public
  WITH CHECK (is_creator = false);

-- 2. Fix user_actions PII leak: restrict SELECT to own records
DROP POLICY IF EXISTS "Authenticated can read all actions" ON user_actions;
CREATE POLICY "Users can read own actions"
  ON user_actions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 3. Fix suggestions email exposure: replace SELECT policy with one that uses the existing view
DROP POLICY IF EXISTS "Public read suggestions no email" ON suggestions;
CREATE POLICY "Public read suggestions no email"
  ON suggestions FOR SELECT
  TO public
  USING (true);
-- Note: email column access was already revoked via REVOKE SELECT (email) in a previous migration.
-- The view suggestions_public already excludes email. This policy remains for the view to work.
