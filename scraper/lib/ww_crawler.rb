require 'httparty'
require "nokogiri"
require 'logger'
require 'csv'
require 'htmlentities'

class WwCrawler
  def initialize(category, url)
    @category = category
    @url = url
    @data = []
    puts "created WwCrawler with #{@url}"
  end


  def get_page_number
    response = HTTParty.get(@url)
    content = response.body
    #string search on <li class="page-ellipses">...</li>
    #        <li class="page-number">
    #            <a href="/Shop/Specials?page=192" class="_jumpTop">192</a>
    pos = content.rindex('<li class="page-number')
    pos = content.index('<a', pos)
    pos = content.index('>', pos)
    pos2 = content.index('<', pos)
    number = content.slice(pos+1, pos2-pos-1).to_i
    puts "Total page number is #{number}"
    number
  rescue
    puts "error occured in getting page number"
    0
  end

  def crawl
    @data = []
    page_number = get_page_number
    (1..page_number).each do |n|
      url = @url + "?page=#{n}&_mode=ajax&_ajaxsource=content-panel";
      puts "getting #{url}"
      response = HTTParty.get(url)
      doc = Nokogiri::XML::Document.parse(response.body)
      node = doc.root.xpath('.//div[@id="content-panel"]')
      content_node = Nokogiri::XML::Document.parse("<div> #{node.inner_text} </div>").root
      #puts content_node
      get_data_from_content_node content_node
    end
    write
  end

  def get_data_from_content_node content_node
    content_node.xpath(".//div[contains(@class, 'product-stamp product-stamp-grid')]").each do |node|
      begin
        prod_name_node = node.xpath(".//div[@class='details-container']//span[contains(@class,'description')]");
        price_node = node.xpath(".//div[@class='price-container']/span[@class='price special-price']");
        
        original_price_node = node.xpath(".//div[@class='price-container']/span[@class='was-price']");
        img_node = node.xpath(".//div[@class='details-container']/h3/a/img/@src");
        next if (prod_name_node == nil || price_node == nil || original_price_node == nil || img_node == nil) 

        name = HTMLEntities.new.decode(prod_name_node.inner_text.strip)
       
        img = img_node.inner_text.strip.gsub(/\/small\//, "/big/");
        img = "http://www2.woolworthsonline.com.au#{img}"

        now = price_node.inner_text.strip.match(/\$(\d+\.\d+)/)[1]
        was = original_price_node.inner_text.strip.match(/\$(\d+\.\d+)/)[1]

        info = {}
        info[:category] = @category
        info[:was] = was   
        info[:now] = now   
        info[:img] = img
        info[:title] = name
        @data.push(info)
      rescue
      end
    end
  end

  def write
    CSV.open(File.join(File.dirname(__FILE__),'ww.csv'), "ab") do |csv|
      @data.each do |item|
        csv << item.values
      end
    end
  end

end





