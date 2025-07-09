comet-history

• Install  
  npm install -g comet-history@latest

• Bash hook (add to ~/.bashrc)  
  ```bash
 record_command() {
  # grab last history entry, strip its index
  local cmd
  cmd=$(history 1 | sed 's/^[ ]*[0-9]*[ ]*//')
  [[ -z "$cmd" ]] && return

  # skip navigation, trivial commands, our CLI, shells, REPLs, etc.
  case "$cmd" in
    cd|cd\ *|exit|pwd|history*|ls*|clear*|cls* \
    |comet-history*|mongosh*|node* )
      return
      ;;
  esac

  # record asynchronously
  comet-history record "$PWD" "$cmd" >/dev/null 2>&1 &
  disown
}
  export PROMPT_COMMAND="record_command;update_prompt"
  ```

• Usage  
  comet-history ls [base]   # list commands under cwd or given folder

• Reset data  
  comet-history clear
