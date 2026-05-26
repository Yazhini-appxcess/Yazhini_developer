export interface IntegrationMetadata {
    id: number;
    slug: string;
    name: string;
    description: string;
    logo_url: string;
    primary_color: string;
    hub: 'erp' | 'crm' | 'database' | 'mes';
}

export const ERP_INTEGRATIONS: IntegrationMetadata[] = [
    {
        id: 29,
        slug: "procore",
        name: "Procore",
        description: "Cloud-based construction management software.",
        logo_url: "https://www.google.com/s2/favicons?domain=procore.com&sz=128",
        primary_color: "#FE5000",
        hub: "erp"
    },
    {
        id: 5,
        slug: "sage-intacct-construction",
        name: "Sage Intacct / Construction",
        description: "Cloud financial management and construction accounting.",
        logo_url: "https://www.google.com/s2/favicons?domain=sageintacct.com&sz=128",
        primary_color: "#00DC00",
        hub: "erp"
    },
    {
        id: 22,
        slug: "sage-accounting-erp",
        name: "Sage 50 / 100 / 200 / 300 / X3",
        description: "Comprehensive business management and accounting solutions.",
        logo_url: "https://www.google.com/s2/favicons?domain=sage.com&sz=128",
        primary_color: "#00DC00",
        hub: "erp"
    },
    {
        id: 26,
        slug: "sage-cre-contractor",
        name: "Sage 100 Contractor / 300 CRE",
        description: "Specialized Construction and Real Estate management solutions.",
        logo_url: "https://www.google.com/s2/favicons?domain=sage.com&sz=128",
        primary_color: "#00DC00",
        hub: "erp"
    },
    {
        id: 1,
        slug: "sap",
        name: "SAP S/4HANA",
        description: "Enterprise resource planning suite for large enterprises.",
        logo_url: "https://www.google.com/s2/favicons?domain=sap.com&sz=128",
        primary_color: "#008FD3",
        hub: "erp"
    },
    {
        id: 2,
        slug: "oracle-netsuite",
        name: "Oracle NetSuite",
        description: "Unified business management suite.",
        logo_url: "https://www.google.com/s2/favicons?domain=netsuite.com&sz=128",
        primary_color: "#000000",
        hub: "erp"
    },
    {
        id: 3,
        slug: "odoo",
        name: "Odoo ERP",
        description: "An all-in-one business software including CRM, website, and e-commerce.",
        logo_url: "https://www.google.com/s2/favicons?domain=odoo.com&sz=128",
        primary_color: "#875A7B",
        hub: "erp"
    },
    {
        id: 4,
        slug: "workday",
        name: "Workday ERP",
        description: "Cloud-based ERP for financial management and HR.",
        logo_url: "https://www.google.com/s2/favicons?domain=workday.com&sz=128",
        primary_color: "#005CB9",
        hub: "erp"
    },
    {
        id: 6,
        slug: "infor-cloudsuite",
        name: "Infor CloudSuite",
        description: "Industry-specific cloud software for manufacturing.",
        logo_url: "https://www.google.com/s2/favicons?domain=infor.com&sz=128",
        primary_color: "#FF0000",
        hub: "erp"
    },
    {
        id: 7,
        slug: "epicor",
        name: "Epicor ERP",
        description: "Industry-specific ERP for retail and manufacturing.",
        logo_url: "https://www.google.com/s2/favicons?domain=epicor.com&sz=128",
        primary_color: "#CB333B",
        hub: "erp"
    },
    {
        id: 8,
        slug: "acumatica",
        name: "Acumatica",
        description: "Cloud ERP for small and mid-sized businesses.",
        logo_url: "https://www.google.com/s2/favicons?domain=acumatica.com&sz=128",
        primary_color: "#3049AD",
        hub: "erp"
    },
    {
        id: 9,
        slug: "syspro",
        name: "Syspro ERP",
        description: "Specialized ERP for manufacturing and distribution.",
        logo_url: "https://www.google.com/s2/favicons?domain=syspro.com&sz=128",
        primary_color: "#C1272D",
        hub: "erp"
    },
    {
        id: 10,
        slug: "unit4",
        name: "Unit4 ERP",
        description: "Enterprise software for people-centric organizations.",
        logo_url: "https://www.google.com/s2/favicons?domain=unit4.com&sz=128",
        primary_color: "#014B7F",
        hub: "erp"
    },
    {
        id: 11,
        slug: "deltek",
        name: "Deltek",
        description: "ERP for project-based businesses and agencies.",
        logo_url: "https://www.google.com/s2/favicons?domain=deltek.com&sz=128",
        primary_color: "#E20613",
        hub: "erp"
    },
    {
        id: 12,
        slug: "ifs-cloud",
        name: "IFS Cloud",
        description: "Single platform for service, projects, and manufacturing.",
        logo_url: "https://www.google.com/s2/favicons?domain=ifs.com&sz=128",
        primary_color: "#4A00D1",
        hub: "erp"
    },
    {
        id: 13,
        slug: "plex",
        name: "Plex Smart Mfg",
        description: "Smart manufacturing platform for total shop floor control.",
        logo_url: "https://www.google.com/s2/favicons?domain=plex.com&sz=128",
        primary_color: "#00ADEF",
        hub: "erp"
    },
    {
        id: 14,
        slug: "qad",
        name: "QAD",
        description: "Adaptive ERP for global manufacturing enterprises.",
        logo_url: "https://www.google.com/s2/favicons?domain=qad.com&sz=128",
        primary_color: "#004B8D",
        hub: "erp"
    },
    {
        id: 15,
        slug: "ramco",
        name: "Ramco ERP",
        description: "Cloud-based ERP for aviation, HR, and logistics.",
        logo_url: "https://www.google.com/s2/favicons?domain=ramco.com&sz=128",
        primary_color: "#EE2326",
        hub: "erp"
    },
    {
        id: 16,
        slug: "tally-prime",
        name: "TallyPrime",
        description: "Business management software for accounting, inventory, and payroll.",
        logo_url: "https://www.google.com/s2/favicons?domain=tallysolutions.com&sz=128",
        primary_color: "#183884",
        hub: "erp"
    },
    {
        id: 17,
        slug: "deskera",
        name: "Deskera",
        description: "All-in-one cloud software for small and mid-sized businesses.",
        logo_url: "https://www.google.com/s2/favicons?domain=deskera.com&sz=128",
        primary_color: "#E20000",
        hub: "erp"
    },
    {
        id: 18,
        slug: "brightpearl",
        name: "Brightpearl",
        description: "Retail operating system for fast-growing merchants.",
        logo_url: "https://www.google.com/s2/favicons?domain=brightpearl.com&sz=128",
        primary_color: "#F8941E",
        hub: "erp"
    },
    {
        id: 19,
        slug: "fishbowl",
        name: "Fishbowl",
        description: "Inventory management software for small to medium-sized businesses.",
        logo_url: "https://www.google.com/s2/favicons?domain=fishbowlinventory.com&sz=128",
        primary_color: "#1B7EBE",
        hub: "erp"
    },
    {
        id: 20,
        slug: "priority",
        name: "Priority Software",
        description: "Scalable ERP solutions for manufacturing and services.",
        logo_url: "https://www.google.com/s2/favicons?domain=priority-software.com&sz=128",
        primary_color: "#F69C13",
        hub: "erp"
    },
    {
        id: 21,
        slug: "dynamics-gp",
        name: "MS Dynamics GP",
        description: "Midmarket business accounting or ERP software.",
        logo_url: "https://www.google.com/s2/favicons?domain=microsoft.com&sz=128",
        primary_color: "#00A4EF",
        hub: "erp"
    }
];

export const CRM_INTEGRATIONS: IntegrationMetadata[] = [
    {
        id: 1,
        slug: "salesforce",
        name: "Salesforce",
        description: "Leading cloud CRM platform.",
        logo_url: "https://www.google.com/s2/favicons?domain=salesforce.com&sz=128",
        primary_color: "#00A1E0",
        hub: "crm"
    },
    {
        id: 2,
        slug: "hubspot",
        name: "HubSpot",
        description: "Inbound marketing, sales, and service software.",
        logo_url: "https://www.google.com/s2/favicons?domain=hubspot.com&sz=128",
        primary_color: "#FF7A59",
        hub: "crm"
    },
    {
        id: 22,
        slug: "ms-dynamics-365-sales",
        name: "MS Dynamics 365 Sales",
        description: "Microsoft's cloud business management and sales suite.",
        logo_url: "https://www.google.com/s2/favicons?domain=microsoft.com&sz=128",
        primary_color: "#00A4EF",
        hub: "crm"
    },
    {
        id: 23,
        slug: "sage-crm",
        name: "Sage CRM",
        description: "Cloud and on-premise CRM for small and medium businesses.",
        logo_url: "https://www.google.com/s2/favicons?domain=sage.com&sz=128",
        primary_color: "#00DC00",
        hub: "crm"
    },
    {
        id: 4,
        slug: "zoho",
        name: "Zoho CRM",
        description: "Online CRM for managing your sales, marketing, and support.",
        logo_url: "https://www.google.com/s2/favicons?domain=zoho.com&sz=128",
        primary_color: "#F6F6F6",
        hub: "crm"
    },
    {
        id: 3,
        slug: "pipedrive",
        name: "Pipedrive",
        description: "Sales-focused CRM and pipeline management.",
        logo_url: "https://www.google.com/s2/favicons?domain=pipedrive.com&sz=128",
        primary_color: "#000000",
        hub: "crm"
    },
    {
        id: 5,
        slug: "sugar-crm",
        name: "SugarCRM",
        description: "Customer lifecycle and experience management platform.",
        logo_url: "https://www.google.com/s2/favicons?domain=sugarcrm.com&sz=128",
        primary_color: "#E31B23",
        hub: "crm"
    },
    {
        id: 6,
        slug: "zendesk-sell",
        name: "Zendesk Sell",
        description: "Sales CRM to enhance productivity and pipeline visibility.",
        logo_url: "https://www.google.com/s2/favicons?domain=zendesk.com&sz=128",
        primary_color: "#03363D",
        hub: "crm"
    },
    {
        id: 7,
        slug: "freshsales",
        name: "Freshsales",
        description: "AI-powered sales CRM by Freshworks.",
        logo_url: "https://www.google.com/s2/favicons?domain=freshworks.com&sz=128",
        primary_color: "#00A3FF",
        hub: "crm"
    },
    {
        id: 8,
        slug: "keap",
        name: "Keap",
        description: "Small business CRM, sales, and marketing automation.",
        logo_url: "https://www.google.com/s2/favicons?domain=keap.com&sz=128",
        primary_color: "#38A129",
        hub: "crm"
    },
    {
        id: 9,
        slug: "insightly",
        name: "Insightly",
        description: "Modern CRM for growing teams.",
        logo_url: "https://www.google.com/s2/favicons?domain=insightly.com&sz=128",
        primary_color: "#FF5E14",
        hub: "crm"
    },
    {
        id: 10,
        slug: "monday-crm",
        name: "Monday.com CRM",
        description: "Fully customizable CRM for managing every sales process.",
        logo_url: "https://www.google.com/s2/favicons?domain=monday.com&sz=128",
        primary_color: "#6161FF",
        hub: "crm"
    },
    {
        id: 11,
        slug: "copper",
        name: "Copper",
        description: "The CRM for Google Workspace users.",
        logo_url: "https://www.google.com/s2/favicons?domain=copper.com&sz=128",
        primary_color: "#FF4A52",
        hub: "crm"
    },
    {
        id: 12,
        slug: "agile-crm",
        name: "Agile CRM",
        description: "All-in-one CRM with sales, marketing, and service automation.",
        logo_url: "https://www.google.com/s2/favicons?domain=agilecrm.com&sz=128",
        primary_color: "#1A9B6B",
        hub: "crm"
    },
    {
        id: 13,
        slug: "nimble",
        name: "Nimble",
        description: "The simple, smart CRM for Microsoft 365 and Google Workspace.",
        logo_url: "https://www.google.com/s2/favicons?domain=nimble.com&sz=128",
        primary_color: "#1884F2",
        hub: "crm"
    },
    {
        id: 14,
        slug: "bitrix24",
        name: "Bitrix24",
        description: "Free CRM for small business with 35+ tools.",
        logo_url: "https://www.google.com/s2/favicons?domain=bitrix24.com&sz=128",
        primary_color: "#00AEEF",
        hub: "crm"
    },
    {
        id: 15,
        slug: "capsule-crm",
        name: "Capsule CRM",
        description: "The CRM for building strong relationships.",
        logo_url: "https://www.google.com/s2/favicons?domain=capsulecrm.com&sz=128",
        primary_color: "#ED753D",
        hub: "crm"
    },
    {
        id: 16,
        slug: "less-annoying-crm",
        name: "Less Annoying CRM",
        description: "Simple CRM built for small businesses.",
        logo_url: "https://www.google.com/s2/favicons?domain=lessannoyingcrm.com&sz=128",
        primary_color: "#00BFFF",
        hub: "crm"
    },
    {
        id: 17,
        slug: "close",
        name: "Close.com",
        description: "Elastic CRM for high-growth sales teams.",
        logo_url: "https://www.google.com/s2/favicons?domain=close.com&sz=128",
        primary_color: "#000000",
        hub: "crm"
    },
    {
        id: 18,
        slug: "creatio",
        name: "Creatio",
        description: "Intelligent low-code platform for process management and CRM.",
        logo_url: "https://www.google.com/s2/favicons?domain=creatio.com&sz=128",
        primary_color: "#FF4E00",
        hub: "crm"
    },
    {
        id: 19,
        slug: "vtiger",
        name: "Vtiger",
        description: "Open source CRM for small and medium businesses.",
        logo_url: "https://www.google.com/s2/favicons?domain=vtiger.com&sz=128",
        primary_color: "#F05A28",
        hub: "crm"
    },
    {
        id: 20,
        slug: "scoro",
        name: "Scoro",
        description: "All-in-one business management software for teams.",
        logo_url: "https://www.google.com/s2/favicons?domain=scoro.com&sz=128",
        primary_color: "#01BAEF",
        hub: "crm"
    },
    {
        id: 21,
        slug: "nutshell",
        name: "Nutshell",
        description: "User-friendly CRM for sales teams who want to close more deals.",
        logo_url: "https://www.google.com/s2/favicons?domain=nutshell.com&sz=128",
        primary_color: "#FFBC00",
        hub: "crm"
    }
];

export const DATABASE_INTEGRATIONS: IntegrationMetadata[] = [
    {
        id: 1,
        slug: "postgresql",
        name: "PostgreSQL",
        description: "Advanced open source relational database.",
        logo_url: "https://www.google.com/s2/favicons?domain=postgresql.org&sz=128",
        primary_color: "#336791",
        hub: "database"
    },
    {
        id: 2,
        slug: "mongodb",
        name: "MongoDB",
        description: "Document-oriented NoSQL database.",
        logo_url: "https://www.google.com/s2/favicons?domain=mongodb.com&sz=128",
        primary_color: "#47A248",
        hub: "database"
    },
    {
        id: 3,
        slug: "mysql",
        name: "MySQL",
        description: "Open-source relational database management system.",
        logo_url: "https://www.google.com/s2/favicons?domain=mysql.com&sz=128",
        primary_color: "#00758F",
        hub: "database"
    },
    {
        id: 4,
        slug: "sql-server",
        name: "Microsoft SQL Server",
        description: "Relational database management system developed by Microsoft.",
        logo_url: "https://www.google.com/s2/favicons?domain=microsoft.com&sz=128",
        primary_color: "#CC2927",
        hub: "database"
    },
    {
        id: 5,
        slug: "oracle",
        name: "Oracle Database",
        description: "Multi-model database management system.",
        logo_url: "https://www.google.com/s2/favicons?domain=oracle.com&sz=128",
        primary_color: "#F80000",
        hub: "database"
    },
    {
        id: 6,
        slug: "supabase",
        name: "Supabase",
        description: "Open source Firebase alternative.",
        logo_url: "https://www.google.com/s2/favicons?domain=supabase.com&sz=128",
        primary_color: "#3ECF8E",
        hub: "database"
    },
    {
        id: 7,
        slug: "redis",
        name: "Redis",
        description: "In-memory data structure store, used as a database, cache, and message broker.",
        logo_url: "https://www.google.com/s2/favicons?domain=redis.io&sz=128",
        primary_color: "#D82C20",
        hub: "database"
    },
    {
        id: 8,
        slug: "snowflake",
        name: "Snowflake",
        description: "Cloud computing-based data cloud company.",
        logo_url: "https://www.google.com/s2/favicons?domain=snowflake.com&sz=128",
        primary_color: "#29B5E8",
        hub: "database"
    },
    {
        id: 9,
        slug: "dynamodb",
        name: "Amazon DynamoDB",
        description: "Fully managed proprietary NoSQL database service.",
        logo_url: "https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=128",
        primary_color: "#405363",
        hub: "database"
    },
    {
        id: 10,
        slug: "bigquery",
        name: "Google BigQuery",
        description: "Fully managed, serverless enterprise data warehouse.",
        logo_url: "https://www.google.com/s2/favicons?domain=cloud.google.com&sz=128",
        primary_color: "#4285F4",
        hub: "database"
    },
    {
        id: 11,
        slug: "cassandra",
        name: "Apache Cassandra",
        description: "Free and open-source, distributed, wide-column store NoSQL database.",
        logo_url: "https://www.google.com/s2/favicons?domain=cassandra.apache.org&sz=128",
        primary_color: "#1287B1",
        hub: "database"
    },
    {
        id: 12,
        slug: "neo4j",
        name: "Neo4j",
        description: "Graph database management system developed by Neo4j, Inc.",
        logo_url: "https://www.google.com/s2/favicons?domain=neo4j.com&sz=128",
        primary_color: "#008CC1",
        hub: "database"
    },
    {
        id: 13,
        slug: "mariadb",
        name: "MariaDB",
        description: "Community-developed, commercially supported fork of the MySQL relational database.",
        logo_url: "https://www.google.com/s2/favicons?domain=mariadb.org&sz=128",
        primary_color: "#003545",
        hub: "database"
    },
    {
        id: 14,
        slug: "couchdb",
        name: "CouchDB",
        description: "Open-source document-oriented NoSQL database, implemented in Erlang.",
        logo_url: "https://www.google.com/s2/favicons?domain=couchdb.apache.org&sz=128",
        primary_color: "#E42528",
        hub: "database"
    },
    {
        id: 15,
        slug: "firebase",
        name: "Firebase",
        description: "Google's mobile and web app development platform.",
        logo_url: "https://www.google.com/s2/favicons?domain=firebase.google.com&sz=128",
        primary_color: "#FFCA28",
        hub: "database"
    },
    {
        id: 16,
        slug: "clickhouse",
        name: "ClickHouse",
        description: "Fast open-source column-oriented database management system.",
        logo_url: "https://www.google.com/s2/favicons?domain=clickhouse.com&sz=128",
        primary_color: "#FFCC01",
        hub: "database"
    },
    {
        id: 17,
        slug: "elasticsearch",
        name: "Elasticsearch",
        description: "Distributed, RESTful search and analytics engine.",
        logo_url: "https://www.google.com/s2/favicons?domain=elastic.co&sz=128",
        primary_color: "#005571",
        hub: "database"
    },
    {
        id: 18,
        slug: "cockroachdb",
        name: "CockroachDB",
        description: "Cloud-native SQL database for building globally-scaled apps.",
        logo_url: "https://www.google.com/s2/favicons?domain=cockroachlabs.com&sz=128",
        primary_color: "#6933FF",
        hub: "database"
    },
    {
        id: 19,
        slug: "planetscale",
        name: "PlanetScale",
        description: "Serverless MySQL platform with horizontal scaling.",
        logo_url: "https://www.google.com/s2/favicons?domain=planetscale.com&sz=128",
        primary_color: "#000000",
        hub: "database"
    },
    {
        id: 20,
        slug: "tidb",
        name: "TiDB",
        description: "Cloud-native, distributed SQL database for high-concurrency.",
        logo_url: "https://www.google.com/s2/favicons?domain=pingcap.com&sz=128",
        primary_color: "#007BFF",
        hub: "database"
    },
    {
        id: 21,
        slug: "influxdb",
        name: "InfluxDB",
        description: "High-performance time-series database engine.",
        logo_url: "https://www.google.com/s2/favicons?domain=influxdata.com&sz=128",
        primary_color: "#22ADF6",
        hub: "database"
    }
];

export const MES_INTEGRATIONS: IntegrationMetadata[] = [
    {
        id: 1,
        slug: "siemens-opcenter",
        name: "Siemens Opcenter",
        description: "Comprehensive MES for discrete and process manufacturing.",
        logo_url: "https://www.google.com/s2/favicons?domain=siemens.com&sz=128",
        primary_color: "#009999",
        hub: "mes"
    },
    {
        id: 2,
        slug: "rockwell-factorytalk",
        name: "Rockwell FactoryTalk",
        description: "Production management and execution software.",
        logo_url: "https://www.google.com/s2/favicons?domain=rockwellautomation.com&sz=128",
        primary_color: "#E31B23",
        hub: "mes"
    },
    {
        id: 3,
        slug: "aveva-mes",
        name: "AVEVA MES",
        description: "Operations management for operational excellence.",
        logo_url: "https://www.google.com/s2/favicons?domain=aveva.com&sz=128",
        primary_color: "#005596",
        hub: "mes"
    },
    {
        id: 4,
        slug: "honeywell-forge",
        name: "Honeywell Forge",
        description: "Industrial IoT and MES platform for optimized performance.",
        logo_url: "https://www.google.com/s2/favicons?domain=honeywell.com&sz=128",
        primary_color: "#E11A22",
        hub: "mes"
    },
    {
        id: 5,
        slug: "ge-digital-plant",
        name: "GE Digital Plant",
        description: "Plant analytics and execution systems for industrial efficiency.",
        logo_url: "https://www.google.com/s2/favicons?domain=ge.com&sz=128",
        primary_color: "#005EB8",
        hub: "mes"
    },
    {
        id: 6,
        slug: "sap-digital-manufacturing",
        name: "SAP Digital Manufacturing",
        description: "Cloud-based manufacturing execution and insights suite.",
        logo_url: "https://www.google.com/s2/favicons?domain=sap.com&sz=128",
        primary_color: "#008FD3",
        hub: "mes"
    },
    {
        id: 7,
        slug: "plex-mes",
        name: "Plex Smart Manufacturing",
        description: "Native cloud MES for automotive and precision parts.",
        logo_url: "https://www.google.com/s2/favicons?domain=plex.com&sz=128",
        primary_color: "#F68B1E",
        hub: "mes"
    },
    {
        id: 8,
        slug: "dassault-apriso",
        name: "Dassault DELMIA Apriso",
        description: "Global manufacturing operations management system.",
        logo_url: "https://www.google.com/s2/favicons?domain=3ds.com&sz=128",
        primary_color: "#005686",
        hub: "mes"
    },
    {
        id: 9,
        slug: "tulip-interfaces",
        name: "Tulip Operations",
        description: "Front-line operations platform with app-based execution.",
        logo_url: "https://www.google.com/s2/favicons?domain=tulip.co&sz=128",
        primary_color: "#293133",
        hub: "mes"
    },
    {
        id: 10,
        slug: "sepasoft-mes",
        name: "Sepasoft Ignition MES",
        description: "Inductive Automation compatible manufacturing suite.",
        logo_url: "https://www.google.com/s2/favicons?domain=sepasoft.com&sz=128",
        primary_color: "#7E3F98",
        hub: "mes"
    }
];

export const ALL_INTEGRATIONS = [
    ...ERP_INTEGRATIONS,
    ...CRM_INTEGRATIONS,
    ...DATABASE_INTEGRATIONS,
    ...MES_INTEGRATIONS
];
