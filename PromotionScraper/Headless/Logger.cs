using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace Headless
{
	class Logger
	{
		private const string file = @"scraper.log";

		public static void Log(string msg)
		{
			using (var stream = new StreamWriter(file, true))
			{
				stream.WriteLine(msg);	
			}
			

		}
	}
}
