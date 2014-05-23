require_relative 'lib/coles_crawler'
require_relative 'lib/ww_crawler'
require_relative 'lib/sql_writter'
require 'json'

# begin
#   puts "start crawling from coles..."
#   cole_scraper = ColesScraper.new
#   cole_scraper.get_post_query
#   cole_scraper.get_data
#   cole_scraper.write
# rescue Exception => e
#   puts "an error occured in coles scrapper"
#   puts "#{e.message}"
# end

# begin
#   puts "start crawling from Woolworth..."
#   s = WwScraper.new
#   s.get_data
#   s.write
# rescue Exception => e
#   puts "an error occured in Woolworth scrapper"
#   puts "#{e.message}"
# end

def load_categories
  text = File.open('category.json', "rb").read
  #puts text
  categories = JSON.parse(text)
  categories.each do |category, providers|
    providers.each do | provider|
      provider.each do | name, url |
        crawler = get_crawler_by_name(name, category, url)
        begin
          crawler.crawl
        rescue
          console.log($!)
        end
      end
    end
  end
end

def get_crawler_by_name(name, category, url)
  return ColesCrawler.new(category, url) if name.downcase == "coles"
  return WwCrawler.new(category, url) if name.downcase == "woolies"
  raise "cannot crawl #{name}"
end

def delete_csv
  File.delete('./lib/coles.csv') if File.exist?('./lib/coles.csv')
  File.delete('./lib/ww.csv') if File.exist?('./lib/ww.csv')
end

delete_csv
load_categories


#SqlWritter.write




