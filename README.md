comet-history

• Install  
  npm install -g comet-history

• Bash hook (add to ~/.bashrc)  
  ```bash
  record_command() {
    local cmd=$(history 1 | sed 's/^[ ]*[0-9]*[ ]*//')
    [[ -z $cmd ]] && return
    case $cmd in
      cd*|exit|pwd|history*|ls*|clear*|cls*|comet-history*) return;;  
    esac
    comet-history record "$PWD" "$cmd" & disown
  }
  export PROMPT_COMMAND="record_command;update_prompt"
  ```

• Usage  
  comet-history ls [base]   # list commands under cwd or given folder

• Reset data  
  > ~/.config/comet-history/data.json