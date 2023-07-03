using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace QuartetMaker.API
{
    public class Songs
    {
        private ISongs _songs;
        public Songs(ISongs songs)
        {
            _songs = songs;
        }

        [FunctionName("UpdateSong")]
        public async Task<IActionResult> UpdateSong(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
            ILogger log,
            CancellationToken cancellationToken)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            Song data = JsonConvert.DeserializeObject<Song>(requestBody, new JsonSerializerSettings()
            {
                ContractResolver = new DefaultContractResolver() { NamingStrategy = new CamelCaseNamingStrategy() }
            }
            );

            var updatedSong = await _songs.UpdateSong(data, cancellationToken);

            return new OkObjectResult(updatedSong);
        }
    }
}
