require_relative 'lib/coles_scraper'
require_relative 'lib/ww_scraper'
require_relative 'lib/sql_writter'


cole_scraper = ColesScraper.new
cole_scraper.get_post_query
cole_scraper.get_data
cole_scraper.write

s = WwScraper.new
s.get_data
s.write

SqlWritter.write

