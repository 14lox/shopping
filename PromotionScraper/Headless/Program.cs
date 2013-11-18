using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.IO.Compression;
using HtmlAgilityPack;
using Renci.SshNet;

namespace Headless
{
	class Program
	{
		public static void Main(string[] args)
		{
			Runner.Run();

			//if (File.Exists("scraper.log"))
			//	File.Delete("scraper.log");

			//if (File.Exists("insert.sql"))
			//	File.Delete("insert.sql");

			//foreach (var file in Directory.EnumerateFiles(".", "*.csv"))
			//{
			//	File.Delete(file);
			//}

			//Stopwatch sw = new Stopwatch();
			//sw.Start();

			//new ColesScraper().GetData();
			//new WWScraper().GetData();

			//DataProcessor.ProcessData();

			//Runner.Run();
			//sw.Stop();

			//Console.WriteLine(sw.ElapsedMilliseconds);
			Console.WriteLine("Done");
			Console.ReadLine();
		}
	}
}

