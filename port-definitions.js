const portsAndServices = [
  {
    port: 7071,
    protocol: 'http',
    service: 'Azure Function App (func start)',
    notes: 'Local Azure Function app running in VSCode. Example: `func start`.',
    timingSamples: [
        {
            serviceStatus: "on",
            timeMs:"4.2000"
         },
        {
            serviceStatus: "on",
            timeMs:"3.3000"
         },
        {
            serviceStatus: "on",
            timeMs:"3.4000"
         },
        {
            serviceStatus: "off",
            timeMs:"2045.39999"
         },
        {
            serviceStatus: "off",
            timeMs:"2034.40000"
         },
    ]
  },
  {
    port: 8384,
    protocol: 'http',
    service: 'Syncthing GUI',
    notes: 'HTTP web GUI, no authentication, started by SyncTrayzor. Check syncthingController.js',
    timingSamples: [
        {
            serviceStatus: "off",
            timeMs:"2055"
        },
        {
            serviceStatus: "on",
            timeMs:"8"
        },
        {
            serviceStatus: "on",
            timeMs:"12"
        }
    ]
  },
  {
    port: 58846,
    protocol: 'rpc',
    service: 'Deluge Daemon',
    notes: 'DelugeRPC, user=localclient, random generated password. Also Deluge desktop application starts in "standalone" mode which doesnt use daemon',
  },
  {
    port: 8112,
    protocol: 'http',
    service: 'Deluge Web',
    notes: 'Deluge web interface, includes JSON-RPC API.'
  },
  {
    port: 8080,
    protocol: 'http',
    service: 'Common HTTP',
    notes: ''
  },
  {
    service: 'Docker',
    protocol: 'tcp',
    port: 2375,
    notes:'must be specifically enabled',
    notes2:'https://docs.docker.com/reference/cli/dockerd/'
  },
  {
    service: 'Docker encrypted',
    protocol: 'tcp',
    port: 2376,
    notes:''
  },
  {
    service: 'Transmission',
    protocol: 'http rpc',
    port: 9091,
    notes:'HTTP RPC API'
  },
  {
    service: 'mcp-proxy',
    port: 8080,
    ports: [8080,6277],
    protocol: 'http',
    notes:'LLM MCP server proxt. The NodeJS default server listens on port 8080 and /mcp (streamable HTTP) and /sse (SSE) endpoints. Some guides use port 6277. mcp-proxy may be run by MCP Inspector',
    notes2:'https://www.oligo.security/blog/critical-rce-vulnerability-in-anthropic-mcp-inspector-cve-2025-49596'
  },
  {
    port: 1313,
    protocol: 'http',
    service: 'Hugo web server, static site generator',
    notes: ''
  },
  {
    port: 4000,
    protocol: 'http',
    service: 'Jekyll web server, static site generator',
    notes: ''
  },
  
];