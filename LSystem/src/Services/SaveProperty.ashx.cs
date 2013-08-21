using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace LSystem.Services
{
    /// <summary>
    /// To save the lsystem properties to file named Properties.txt
    /// </summary>
    public class SaveProperty: IHttpHandler
    {
        public const string FILENAME = "Properties.txt";

        public void ProcessRequest(HttpContext context)
        {
            var req = context.Request;
            var folder = context.Server.MapPath("~/Upload");
            if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);
            var fullPath = Path.Combine(folder, "Properties.txt");

            using (StreamWriter writer = new StreamWriter(fullPath, true))
            {
                writer.WriteLine(req["data"]);
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