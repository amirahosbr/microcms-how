# Create branch and PR from issue

When you **open a new issue**, the workflow automatically:

1. **Creates a branch** named `issue-<number>-<title-slug>` (e.g. `issue-42-fix-draft-page`).
2. **Opens a draft pull request** that targets your default branch and is linked to the issue.

## How to use

1. Create a new issue (e.g. "Fix draft page loading").
2. Wait for the workflow to run (Actions tab, or check the issue for a comment).
3. You’ll get a new branch (e.g. `issue-42-Fix_draft_page_loading`) and a draft PR.
4. Push your changes to that branch; the PR will update and you can mark it ready for review.

## Configuration

- **Workflow:** `.github/workflows/create-branch-from-issue.yml`
- **Options:** `.github/issue-branch.yml` (mode, branch name, draft PR, link to issue)

To create the branch only when an issue is **assigned** instead of on open, set `mode: auto` in `issue-branch.yml` and add `assigned` to the workflow `on.issues.types`.

## Permissions

In the repo: **Settings → Actions → General → Workflow permissions**, choose **Read and write** so the action can create branches and pull requests.
