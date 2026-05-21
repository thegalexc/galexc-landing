default:
    @just --list

# Edit encrypted deploy secrets locally using the repo-local age key
secrets-edit file='secrets/github.env':
    SOPS_AGE_KEY_FILE=.sops-age-key.txt sops {{file}}

# Verify the repo-local age key can decrypt the encrypted deploy secrets
secrets-check file='secrets/github.env':
    SOPS_AGE_KEY_FILE=.sops-age-key.txt sops -d {{file}} > /dev/null
    @echo "OK: {{file}} decrypts with .sops-age-key.txt"
