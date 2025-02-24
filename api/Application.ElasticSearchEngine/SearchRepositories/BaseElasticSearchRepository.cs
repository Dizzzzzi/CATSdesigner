﻿using Elasticsearch.Net;
using Nest;
using Nest.JsonNetSerializer;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Threading.Tasks;

namespace Application.ElasticSearchEngine.SearchRepositories
{
    public abstract class BaseElasticSearchRepository
    {
        protected const int DEFAULT_NUM_OF_RESULTS = 7;
        private readonly ElasticClient client;
        private string indexName;
        private int searchFuzziness = 6;
        private int prefixLength = 3;

        public BaseElasticSearchRepository(ElasticClient elasticClient, string indexName)
        {
            this.indexName = indexName;
            this.client = elasticClient;
            CheckConnection(client);
        }
        public BaseElasticSearchRepository(string elasticUri, string indexName, int prefixLength, int fuzziness,
            string userName, string password)
        {
            this.indexName = indexName;
            this.searchFuzziness = fuzziness;
            this.prefixLength = prefixLength;

            var pool = new SingleNodeConnectionPool(new Uri(elasticUri));
            ConnectionSettings connectionSettings =
                new ConnectionSettings(pool, sourceSerializer: (builtin, settings) => new JsonNetSerializer(
                    builtin, settings,
                    () => new JsonSerializerSettings
                    {
                        NullValueHandling = NullValueHandling.Include,
                        ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                    },
                    resolver => resolver.NamingStrategy = new CamelCaseNamingStrategy()
                ))
                .DefaultIndex(indexName)
                .BasicAuthentication(userName, password);

            this.client = new ElasticClient(connectionSettings);
            CheckConnection(client);
        }

        protected ElasticClient Client
        {
            get
            {
                return this.client;
            }
        }
        protected int SearchFuziness { get => searchFuzziness; }
        protected int PrefixLength { get => prefixLength; }
        private void CheckConnection(ElasticClient client)
        {
            var isConnected = client.Ping();
            if (!isConnected.IsValid)
            {
                throw new Exception("Client was not connected to ElasticSearch server\n" + isConnected.OriginalException.Message);
            }
        }
        public bool DeleteFromIndex(int id)
        {
            try
            {
                client.Delete(new DeleteRequest(indexName, id));
            }

            catch (Exception)
            {
                return false;
            }

            return true;
        }

        public async Task<bool> DeleteFromIndexAsync(int id) 
        {
            try
            {
                await client.DeleteAsync(new DeleteRequest(indexName, id));
            }
            catch (Exception)
            {
                return false;
            }

            return true;
        }

        public bool DeleteIndex()
        {
            try
            {
                client.Indices.Delete(indexName);
            }

            catch (Exception)
            {
                return false;
            }

            return true;
        }

        enum SearchingFields
        {
            Id,
            FirstName,
            MiddleName,
            LastName,
            Group,
            Name
        }

    }
}
