require 'httparty'
require "nokogiri"
require 'logger'
require 'csv'

LOGGER = Logger.new(STDOUT)
LOGGER.level = Logger::WARN

class ColesCrawler
  attr_reader :data

  def initialize(category, url)
    @category = category
    @url = url
    @data = []
    puts "created ColesCrawler with #{@url}"
  end

  def crawl
    get_post_query

    @data = []
    beginIndex = 0;
    has_more = true;
    pageSize = @query_body[:pageSize].to_i
    header = {"Content-Type" => "application/x-www-form-urlencoded"}
    while  has_more
      puts "beginIndex is #{beginIndex}, data count is #{data.length}"
      @query_body['beginIndex'] = beginIndex
      doc = get_xml_doc(header)
      has_more = get_data_from_xml_doc(doc)
      #has_more = false
      beginIndex += pageSize
    end
    write_to_csv
  end

  def get_post_query
    response = HTTParty.get(@url)
    page_info_finder = PageInfoFinder.new
    parser = Nokogiri::HTML::SAX::Parser.new(page_info_finder)
    parser.parse(response.body)
    @query_body = page_info_finder.query_body
    #puts @query_body.inspect
  end

  

  def get_xml_doc(header) 
    5.times do
      response = HTTParty.post('http://shop.coles.com.au/online/national/specials-offers/ColesCategoryView', :header => header, :body => @query_body)
      doc = Nokogiri::XML::Document.parse(response.body)
      return doc unless doc.root == nil
      puts 'post to coles failed, try again'
      sleep 5
    end
    return
  end

  def get_data_from_xml_doc(doc)
    save_nodes = doc.root.xpath('.//div[contains(@class,"promo save")]')
    multibuy_nodes = doc.root.xpath('.//div[contains(@class,"promo multiBuy")]')

    get_saving_from_save_nodes save_nodes
    get_saving_from_multibuy_nodes multibuy_nodes

    save_nodes.length + multibuy_nodes.length > 0
  end


  def get_saving_from_save_nodes save_nodes
    save_nodes.each do |node|
      begin
        price_node = node.xpath('.//div[@class="price"]')
        now = price_node.inner_text.match(/\$(\d+\.\d+)/)[1]
        original_node = node.xpath('.//div[@class="saving"]')
        match = original_node.inner_text.match(/\$(\d+\.\d+)/)
        was = match == nil ? 0 : match[1]
        social_node = node.xpath('.//div[@id="share"]')
        info = get_info_from_social_node(social_node)
        @data.push({was:was, now:now}.merge(info).merge({category: @category})) if info != {}
      rescue
        LOGGER.error("find an exception in saving node #{$!}")
      end
    end
  end

  def get_saving_from_multibuy_nodes multibuy_nodes
    multibuy_nodes.each do |node|
      begin
        price_node = node.xpath('.//div[@class="offer-detail"]')
        now = price_node.inner_text
        social_node = node.xpath('.//div[@id="share"]')
        info = get_info_from_social_node(social_node)
        @data.push({was:0, now:now}.merge(info).merge({category: @category})) if info != {}
      rescue
        LOGGER.error("find an exception in multibuy node #{$!}")
      end
    end
  end

  def get_info_from_social_node node
    info = {}
    content = node.xpath("./@data-social").inner_text.gsub(/\{(.*)\}/, '\1')
    img = content.match(/.*productImgUrl:'(.*)'.*,productDisplayUrl/)[1]
    title = content.match(/.*title:'(.*)'.*,description/)[1]
    if(img != nil && title != nil) 
      info[:img] = img.strip.sub(/com\.au:\d+/, 'com.au')
      info[:title] = title.strip
    end
    info
    rescue
      LOGGER.error("get data from social_node has an error: #{$!}")
      {}
  end

  def write_to_csv
    CSV.open(File.join(File.dirname(__FILE__),'coles.csv'), "ab") do |csv|
      @data.each do |item|
        csv << item.values
      end
    end
  end
end


class PageInfoFinder < Nokogiri::XML::SAX::Document
  attr_reader :store_id, :catalog_id, :category_id, :page_size, :query

  def start_element name, attributes = []
    if(name == 'div') #&& attributes['id'] == 'searchDisplay')
      found = false;
      attributes.each do |attr|
        found ||= (attr[0] == 'id' && attr[1] == 'searchDisplay')
      end
      if found
        attributes.each do |attr|
          if(attr[0] == 'data-refresh')
            hash = eval(attr[1])
            @store_id = hash[:storeId]
            @catalog_id = hash[:catalogId]
            @category_id = hash[:categoryId]
            @page_size = hash[:pageSize]
          end
        end
      end
    end
  end

  def query_body
    if @store_id == nil || @category_id == nil || @page_size == nil || catalog_id == nil
      log.error('coles scraper: cannot find query body')
      return nil
    end
    {:pageSize=> @page_size, :storeId=> @store_id, :catalogId=> @catalog_id, :categoryId=> @category_id}
  end
end
