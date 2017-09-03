# HyperCwd

Opens new tabs with the same directory as the current tab in [Hyper](https://hyper.is/).

![New Tabs](https://raw.githubusercontent.com/hharnisc/hypercwd/master/newTabs.gif)

## Installation

Open ~/.hyper.js and add `hypercwd` to the list of plugins.

## Configuration

`hypercwd` can be configured with a configuration file:


**OS X/Linux/Powershell**

`~/.hypercwdrc.json`

**Windows**

`%userprofile%\.hypercwdrc.json`

Example file:

```json
{
  "initialWorkingDirectory": "~/Documents"
}
```

### Options

**initialWorkingDirectory** - the path to open the _first_ terminal session

Note: all subsequent sessions are opened with the same directory as the session in focus
