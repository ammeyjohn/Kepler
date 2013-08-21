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
        public const string FILENAME = "Properties.txt";

        public void ProcessRequest(HttpContext context)
        {
            string properties = "";
            var folder = context.Server.MapPath("~/Upload");
            var fullPath = Path.Combine(folder, "Properties.txt");
            if (File.Exists(fullPath))
            {
                using (StreamReader reader = new StreamReader(fullPath))
                {
                    properties = reader.ReadToEnd();
                }
            }

            context.Response.ContentType = "text/json";
            context.Response.Write(properties); 
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