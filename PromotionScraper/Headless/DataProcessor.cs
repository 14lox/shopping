using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace Headless
{
	class DataProcessor
	{
		private const string pattern = "insert into promotion.Current (supplierId, name, newPrice, oldPrice, save, link, img, startDate, endDate) values ({0}, \"{1}\", \"{2}\", \"{3}\", {4}, \"{5}\", \"{6}\", \"2013/01/01\", \"2020/01/01\");";
		public static bool ProcessData()
		{
			using (var mysqlFile = new StreamWriter("insert.sql"))
			{
				foreach (var file in Directory.EnumerateFiles(".", "*.csv"))
				{
					SupplierIdMapping supplier;
					if (!SupplierIdMapping.TryParse(Path.GetFileNameWithoutExtension(file), out supplier))
					{
						Logger.Log("supplier not defined " + Path.GetFileNameWithoutExtension(file));
						return false;
					}
					foreach (var line in File.ReadAllLines(file))
					{
						ProcessLine(supplier, line, mysqlFile);
					}

				}
			}
			return true;
		}

		private static void ProcessLine(SupplierIdMapping supplier, string line, StreamWriter mysqlFile)
		{
			var items = line.Split(new[] {','});
			if (items.Count() != 5)
			{
				Logger.Log("Invalid item : " + line);
			}
			var newPrice = NormalizeNewPrice(items[1]);
			var oldPrice = NormalizeOldPrice(items[2]);
			var savePercentage = GetSavePercentage(items[1], items[2]);
			mysqlFile.WriteLine(pattern, (int)supplier, items[0], newPrice, oldPrice, savePercentage, items[3], items[4]);
		}

		private static string NormalizeNewPrice(string p)
		{
			decimal newPriceVal;
			if (decimal.TryParse(p.Remove("$").Trim(), out newPriceVal))
			{
				return "$" + newPriceVal;
			}
			return p;
		}

		private static string NormalizeOldPrice(string p)
		{
			decimal oldPriceVal;
			var temp = p.ToLower().Remove("$").Remove("was").Trim();
			if (decimal.TryParse(temp, out oldPriceVal))
			{
				return "was $" + oldPriceVal;
			}
			return p;
		}

		private static int GetSavePercentage(string newPrice, string oldPrice)
		{
			decimal newPriceVal;
			if (decimal.TryParse(newPrice.Replace("$", "").Trim(), out newPriceVal))
			{
				decimal oldPriceVal;
				if (decimal.TryParse(oldPrice.ToLower().Remove("was").Remove("$"), out oldPriceVal))
				{
					return (int)((oldPriceVal - newPriceVal)*100/oldPriceVal);
				}
			}
			return 0;
		}
	}
}
