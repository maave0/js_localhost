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
  {
    port: 3000,
    protocol: "http",
    service: "Node.js Express",
    notes: "Default port for Express.js and many Node.js development servers."
  },
  {
    port: 5000,
    protocol: "http",
    service: "Flask",
    notes: "Default port for Flask development server. Sometimes also used for other Python APIs."
  },
  {
    port: 8000,
    protocol: "http",
    service: "Django / FastAPI / Python http.server",
    notes: "Default for Django dev server, FastAPI with uvicorn, and Python's built-in http.server."
  },
  {
    port: 4200,
    protocol: "http",
    service: "Angular CLI",
    notes: "Default port for Angular development server (ng serve)."
  },
  {
    port: 8081,
    protocol: "http",
    service: "React Native Metro bundler",
    notes: "Default port for the React Native Metro bundler. Also sometimes used as an alternate HTTP server port."
  },
  {
    port: 8888,
    protocol: "http",
    service: "Jupyter Notebook / JupyterLab",
    notes: "Default port for Jupyter Notebook and JupyterLab web interface."
  },
  {
    port: 9000,
    protocol: "fastcgi",
    service: "php-fpm",
    notes: "php-fpm listens on 9000 for FastCGI. Some custom HTTP servers may also use 9000."
  },
  
  {
    port: 8888,
    protocol: "http",
    service: "Apache Druid Router",
    notes: "Default port for Druid Router (query API). Coordinator/Overlord usually run on 8081."
  },
  {
    port: 5001,
    protocol: "http",
    service: "IPFS API",
    notes: "Default port for IPFS HTTP API. Gateway runs on 8080."
  },  
  {
    port: 3001,
    protocol: "http",
    service: "ReactJS (alternate)",
    notes: "Fallback port when 3000 is in use for Create React App dev server."
  },
    {
    port: 15672,
    protocol: "http",
    service: "RabbitMQ Management",
    notes: "Management web UI. Broker itself listens on 5672 (AMQP over TCP)."
  },
  {
    port: 9001,
    protocol: "http",
    service: "MinIO Console",
    notes: "Default port for MinIO management console. API itself runs on 9000."
  },
  {
    "port": 9200,
    "protocol": "http",
    "service": "Elasticsearch",
    "notes": "Default HTTP port for Elasticsearch REST API. Transport protocol uses 9300."
  },
    {
    "port": 6443,
    "protocol": "https",
    "service": "Kubernetes API Server",
    "notes": "Default secure port for Kubernetes cluster API."
  },

  
  {
    port: 6379,
    protocol: "tcp",
    service: "Redis",
    notes: "Default port for Redis key-value store."
  },
  {
    port: 27017,
    protocol: "tcp",
    service: "MongoDB",
    notes: "Default port for MongoDB database."
  },
  {
    port: 5432,
    protocol: "tcp",
    service: "PostgreSQL",
    notes: "Default port for PostgreSQL database."
  },
  {
    port: 3306,
    protocol: "tcp",
    service: "MySQL/MariaDB",
    notes: "Default port for MySQL and MariaDB databases."
  },
  {
    port: 1883,
    protocol: "tcp",
    service: "Mosquitto MQTT",
    notes: "Default port for MQTT broker (unencrypted)"
  },
  {
    port: 8883,
    protocol: "tcp",
    service: "Mosquitto MQTT",
    notes: "MQTT broker, TLS"
  },


];