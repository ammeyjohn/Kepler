using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace LSystem.Services
{
    /// <summary>
    /// To load lsystem properties from Properties.txt.
    /// </summary>
    public class LoadProperty : IHttpHandler
    {
        public const string FILENAME = "~/json/propertygrid_data.json";

        public void ProcessRequest(HttpContext context)
        {
            var fullPath = context.Server.MapPath(FILENAME);
            using (StreamReader reader = new StreamReader(fullPath))
            {
                string json = reader.ReadToEnd();
                context.Response.ContentType = "text/plain";
                context.Response.Write(json);
            }
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}