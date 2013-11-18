using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using HtmlAgilityPack;

namespace Headless
{
	public interface IScraper
	{
		bool GetData();
	}
	
	class ColesScraper :IScraper
	{
		static int count = 1;
		private const string host = "http://shop.coles.com.au";
		string fileName = SupplierIdMapping.Coles + ".csv";
		public bool GetData()
		{
			using (var sw = new StreamWriter(fileName))
			{
				var web = new HtmlWeb();
				var doc = web.Load(@"http://shop.coles.com.au/online/national/specials-offers/specials-offers");

				var containerNode = doc.DocumentNode.SelectSingleNode("/html/body/div[@id='promoContainer']/div[@id='container']/div[@id='contentPane']/div[@id='searchDisplay']");

				GetDataFromContainerNode(containerNode, sw);
				string postBody, pageSize;
				GetPostParamsFromNode(containerNode, out postBody, out pageSize);

				var beginIndex = int.Parse(pageSize);
				while (true)
				{
					var request = (HttpWebRequest) WebRequest.Create("http://shop.coles.com.au/online/national/specials-offers/ColesCategoryView");
					request.Method = "POST";
					request.ContentType = "application/x-www-form-urlencoded";
					request.UserAgent = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.69 Safari/537.36";
					request.AutomaticDecompression = DecompressionMethods.Deflate | DecompressionMethods.GZip;
					var body = string.Format(postBody, beginIndex);
					byte[] byteArray = Encoding.UTF8.GetBytes(body);

					using (Stream requestStream = request.GetRequestStream())
					{
						requestStream.Write(byteArray, 0, byteArray.Length);
					}
					var response = (HttpWebResponse) request.GetResponse();
					Encoding responseEncoding = Encoding.GetEncoding(response.CharacterSet);
					using (StreamReader sr = new StreamReader(response.GetResponseStream(), responseEncoding))
					{
						doc = new HtmlAgilityPack.HtmlDocument();
						doc.LoadHtml(sr.ReadToEnd());
						var container = doc.DocumentNode.SelectSingleNode("/div[@id='searchDisplay']");
						if (!GetDataFromContainerNode(container, sw))
							break;
					}
					beginIndex += int.Parse(pageSize);
					//break;
				}
				Logger.Log(string.Format("Coles:  {0} items collected", count));
			}
			return true;
		}
	
		private static bool GetDataFromContainerNode(HtmlNode containerNode, StreamWriter sw)
		{
			var container = containerNode.SelectSingleNode("./div[@class='layout-20-80 clearfix']/div[@id='searchResults']/div[@class='list-view viewContainer clearfix searchEspot']");
			if (container == null)
				return false;

			var nodes = container.SelectNodes("./div[@data-refresh]");
			if (nodes == null)
				return false;
			foreach (var node in nodes)
			{
				var prodNameNode = node.SelectSingleNode(".//ul[@class='detail']/li[@class='item']/a/text()");
				var linkNode = node.SelectSingleNode(".//a[@class='product-url']");
				var imgNode = linkNode == null ? null : linkNode.SelectSingleNode("./img");
				var priceNode = node.SelectSingleNode(".//ul[@class='purchasing']/li[@class='price']/text()") ?? node.SelectSingleNode(".//ul[@class='purchasing']/li[@class='offer-detail']/text()");
				//var unitPriceNode = node.SelectSingleNode(".//ul[@class='purchasing']/li[@class='unit-price']/text()");
				var savingNodes = node.SelectSingleNode(".//ul[@class='purchasing']/li[@class='saving']/text()") ?? node.SelectSingleNode(".//ul[@class='purchasing']/li[@class='offer-price']/text()");

				if (prodNameNode != null && priceNode != null && savingNodes != null && linkNode!= null)
				{
					var link = linkNode.GetAttributeValue("href", "");
					link = link.MakeAbsoluteUrl(host);
					var img = imgNode.GetAttributeValue("src", "");
					img = img.MakeAbsoluteUrl(host);
					var content = string.Format("{0},{1},{2},{3}, {4}", prodNameNode.Text(), priceNode.Text(), savingNodes.Text(), link, img);
					count++;
					sw.WriteLine(content);
				}
			}
			return true;
		}

		private static void GetPostParamsFromNode(HtmlNode containerNode, out string query, out string pageSize)
		{
			query = "";
			pageSize = "";
			var attr = containerNode.GetAttributeValue("data-refresh", "");
			var pairs = attr.Replace("{", "").Replace("}", "").Split(new[] { ',' });
			query = "";
			foreach (var pair in pairs)
			{
				var values = pair.Split(new[] { ':' });
				if (values[0].Contains("beginIndex")) { values[1] = "{0}"; }
				if (values[0].Contains("pageSize")) { pageSize = values[1].Replace("'", ""); }
				query += values[0].Trim();
				query += '=';
				query += values[1].Replace("'", "").Trim();
				query += "&";
			}

			query = query.Substring(0, query.Length - 1);

			//{refreshId:'searchView', productView:'list', orderBy:'1', beginIndex:'40', pageSize:'40', storeId:'10601', catalogId:'10576', categoryId:'46634',topcategoryId:'',browseView:'true'}
		}

		
	}
}
