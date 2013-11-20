using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using Renci.SshNet;

namespace Headless
{
	class Runner
	{
		public static void Run()
		{
			var pfFile = new PrivateKeyFile(@"mykey.pem");
			var connectionInfo = new PrivateKeyConnectionInfo("54.252.90.204", "ubuntu", pfFile);
			
			CopyScript(connectionInfo);
			
			//RunRefreshShell(connectionInfo);

		}

		private static void RunRefreshShell(PrivateKeyConnectionInfo connectionInfo)
		{
			using (var ssh = new SshClient(connectionInfo))
			{
				ssh.Connect();
				var cmd = ssh.CreateCommand("sudo /home/ubuntu/se/shopping/script/refresh_sphinx.sh");
				var str = cmd.Execute();
				Console.WriteLine(str);
			}
		}

		private static void CopyScript(ConnectionInfo info)
		{

			var scp = new ScpClient(info);
			scp.Connect();
			scp.Upload(new FileInfo(@"./insert.sql"), "/home/ubuntu/se/shopping/script/");
			scp.Disconnect();
		}
	}
}
