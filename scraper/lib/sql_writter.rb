class SqlWritter
  def self.write
    File.open(File.join(File.dirname(__FILE__), '..', '..', 'sql','insert.sql'), 'w') do |file|
      CSV.read(File.join(File.dirname(__FILE__),'coles.csv'), encoding: "UTF-8").each { |row| write_row(file, row, 1) }#coles supplier id is 1
      CSV.read(File.join(File.dirname(__FILE__),'ww.csv'), encoding: "UTF-8").each { |row| write_row(file, row, 2) }#Wollies supplier id is 1
    end
  end

  def self.write_row(file, row, supplier_id)
    was = row[0].to_f
    now = row[1].to_f
    save = was == 0 ? 0 : ((was - now)/was * 100).ceil
    save == 0 ?
        file.puts("insert into promotion.Current (supplierId, name, newPrice, oldPrice, save, link, img, startDate, endDate) values (#{supplier_id}, \"#{row[3]}\", \"#{row[1]}\", \"0\", 0, \"\", \"#{row[2]}\", \"2013/01/01\", \"2020/01/01\");")
      : file.puts("insert into promotion.Current (supplierId, name, newPrice, oldPrice, save, link, img, startDate, endDate) values (#{supplier_id}, \"#{row[3]}\", \"$#{row[1]}\", \"was $#{row[0]}\", #{save}, \"\", \"#{row[2]}\", \"2013/01/01\", \"2020/01/01\");")
    rescue
      puts $!
  end
end