using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace LSystem.Services
{
    /// <summary>
    /// Summary description for SaveOption
    /// </summary>
    public class SaveOption : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            context.Response.Write("Hello World");
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