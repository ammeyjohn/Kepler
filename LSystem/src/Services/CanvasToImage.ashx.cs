using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Web;

namespace LSystem.Services
{
    /// <summary>
    /// Summary description for CanvasToImage
    /// </summary>
    public class CanvasToImage : IHttpHandler
    {
        public void ProcessRequest(HttpContext context)
        {
            var req = context.Request;

            // 生成Images文件夹，并删除同名文件
            string name = req["name"];
            string folder = context.Server.MapPath("~/Images");
            string filePath = Path.Combine(folder, name);
            if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);            
            if (File.Exists(filePath)) File.Delete(filePath);

            // 将图形从Base64转换为Bitmap对象
            string base64 = req["data"];
            byte[] bytes = Convert.FromBase64String(base64);
            using (MemoryStream ms = new MemoryStream(bytes))
            {
                Bitmap bmp = null;
                using (Bitmap orgBmp = (Bitmap)Bitmap.FromStream(ms))
                {
                    bmp = orgBmp;

                    // 如果设置了宽度和高度并且和图片原始大小不同
                    // 需要将图片按照给定大小进行调整
                    var w = Convert.ToInt32(req["width"]);
                    var h = Convert.ToInt32(req["height"]);
                    if (w != orgBmp.Width || h != orgBmp.Height)
                    {
                        bmp = new Bitmap(w, h);
                        using (Graphics g = Graphics.FromImage(bmp))
                        {
                            //设置高质量插值法   
                            g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.High;
                            //设置高质量,低速度呈现平滑程度   
                            g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;
                            g.CompositingQuality = System.Drawing.Drawing2D.CompositingQuality.HighQuality;
                            //消除锯齿 
                            g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
                            g.DrawImage(orgBmp, new Rectangle(0, 0, w, h), new Rectangle(0, 0, orgBmp.Width, orgBmp.Height), GraphicsUnit.Pixel); 
                        }
                    }

                    bmp.Save(filePath, System.Drawing.Imaging.ImageFormat.Png);
                    bmp.Dispose();
                }
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