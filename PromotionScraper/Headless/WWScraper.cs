using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Xml;
using HtmlAgilityPack;

namespace Headless
{
	internal class WWScraper : IScraper
	{
		private List<string> itemsInPrevPage = new List<string>();
		private List<string> itemsInThisPage = new List<string>();

		private const string host = "http://www2.woolworthsonline.com.au";
		string fileName = SupplierIdMapping.Woolies + ".csv";
		private int count = 0;
		public bool GetData()
		{
			int pageNum = 1;
			var urlPattern = @"http://www2.woolworthsonline.com.au/Shop/Specials?page={0}&_mode=ajax&_ajaxsource=content-panel";
			
			using (var sw = new StreamWriter(fileName))
			{
				while (true)
				{
					var url = string.Format(urlPattern, pageNum);
					var req = (HttpWebRequest) WebRequest.Create(url);
					try
					{
						using (var stream = req.GetResponse().GetResponseStream())
						{
							var doc = GetHtmlDocument(stream);

							var containerNode = doc.DocumentNode.SelectSingleNode("/ajaxresponse/div[@id='content-panel']/div[@id='product-list']");
							if (containerNode == null)
							{
								break;
							}

							var prodNodes = containerNode.SelectNodes("./div");
							if (prodNodes == null)
							{
								break;
							}

							itemsInPrevPage.Clear();
							itemsInPrevPage.AddRange(itemsInThisPage);
							itemsInThisPage.Clear();

							foreach (var prodNode in prodNodes)
							{
								if (!GetDataFromprodNode(prodNode, sw))
								{
									Logger.Log("stop in page " + pageNum);
									Logger.Log(String.Format("Woolwirth: {0} item added", count));
									return true;
								}
							}
						}
					}
					catch (Exception e)
					{
						Logger.Log(string.Format("Exception at page {0} : {1}", e.Message, pageNum));
					}
					
					pageNum++;
					Thread.Sleep(2000);
				}
			}
			return itemsInPrevPage.Count > 0; //if we got something, means we are fine
		}

		private bool GetDataFromprodNode(HtmlNode prodNode, StreamWriter sw)
		{
			var prodNameNode = prodNode.SelectSingleNode(".//div[@class='details-container']//span[contains(@class,'description')]");
			var linkNode = prodNode.SelectSingleNode(".//div[@class='details-container']/h3/a");
			var priceNode = prodNode.SelectSingleNode(".//div[@class='price-container']/span[@class='price special-price']");
			var originalPriceNode = prodNode.SelectSingleNode(".//div[@class='price-container']/span[@class='was-price']");

			if (prodNameNode == null || priceNode == null || originalPriceNode == null || linkNode == null)
			{
				Logger.Log("WWScrapper: cannot find prodNameNode or priceNode or originalPriceNode or linkNode");
				return true;
			}
			var imgNode = linkNode.SelectSingleNode("./img");

			var prodName = prodNameNode.Text();
			if (itemsInPrevPage.Contains(prodName) && itemsInPrevPage.IndexOf(prodName)==0 && !itemsInThisPage.Any() )
			{
				return false;
			}
			itemsInThisPage.Add(prodName);

			var link = linkNode.GetAttributeValue("href", "");
			link = link.MakeAbsoluteUrl(host);
			var img = imgNode.GetAttributeValue("src", "");
			img = img.MakeAbsoluteUrl(host);

			var content = string.Format("{0},{1},{2},{3},{4}", prodNameNode.Text(), priceNode.Text(), originalPriceNode.Text(), link, img);
			sw.WriteLine(content);
			count++;
			return true;
		}

		private static HtmlDocument GetHtmlDocument(Stream stream)
		{
			Encoding encode = System.Text.Encoding.GetEncoding("utf-8");
			var readStream = new StreamReader(stream, encode);
			var text = readStream.ReadToEnd();
			text = HttpUtility.HtmlDecode(text).Replace("\r\n", "");

			HtmlDocument doc = new HtmlDocument();
			doc.LoadHtml(text);
			return doc;
		}
	}
}
