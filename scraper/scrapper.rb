require_relative 'lib/coles_scraper'
require_relative 'lib/ww_scraper'
require_relative 'lib/sql_writter'

begin
  puts "start crawling from coles..."
  cole_scraper = ColesScraper.new
  cole_scraper.get_post_query
  cole_scraper.get_data
  cole_scraper.write
rescue
  puts "an error occured in coles scrapper"
end

begin
  puts "start crawling from Woolworth..."
  s = WwScraper.new
  s.get_data
  s.write
rescue
  puts "an error occured in coles scrapper"
end


SqlWritter.write

