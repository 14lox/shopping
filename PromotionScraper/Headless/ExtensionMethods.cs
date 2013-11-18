using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HtmlAgilityPack;

namespace Headless
{
	static class ExtensionMethods
	{
		public static string Text(this HtmlNode node)
		{
			var sb = new StringBuilder();
			foreach (var n in node.DescendantNodesAndSelf())
			{
				if (!n.HasChildNodes)
				{
					string text = n.InnerText;
					if (!string.IsNullOrEmpty(text))
						sb.Append(text);
				}
			}
			return sb.ToString().Trim().Replace(",", ";");
		}

		public static string Remove(this String str, string stringToRemvoe)
		{
			return str.Replace(stringToRemvoe, "");
		}

		public static string MakeAbsoluteUrl(this String str, string host)
		{
			if (str != "" && !str.StartsWith("http://") && !str.StartsWith("www"))
				return host + str;
			return str;
		}
	}
}
